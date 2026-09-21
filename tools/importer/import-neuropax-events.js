/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import textblockParser from './parsers/textblock.js';
import regformParser from './parsers/regform.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wehealthcare-cleanup.js';
import sectionsDynamicTransformer from './transformers/neuropax-sections-dynamic.js';

// PARSER REGISTRY
const parsers = {
  'textblock': textblockParser,
  'regform': regformParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
    "name": "neuropax-events",
    "description": "NeuroPax events: a heading textblock plus an event registration form (regform); confirmation page is textblock-only.",
    "urls": [
      "https://main--tvhc--dprevelige.aem.page/en/pharma/neuropax/events",
      "https://main--tvhc--dprevelige.aem.page/en/pharma/neuropax/events/registration-confirmation"
    ],
    "blocks": [
      {
        "name": "textblock",
        "instances": [
          ".textblock-wrapper .textblock.block",
          ".textblock.block"
        ]
      },
      {
        "name": "regform",
        "instances": [
          ".regform-wrapper .regform.block",
          ".regform.block"
        ]
      }
    ],
    "sections": [
      {
        "id": "rc1",
        "name": "heading",
        "selector": [
          ".section.textblock-container",
          "main > .section.textblock-container"
        ],
        "style": null,
        "blocks": [
          "textblock"
        ],
        "defaultContent": []
      },
      {
        "id": "rc2",
        "name": "registration",
        "selector": [
          ".section.default.regform-container",
          "main > .section.regform-container"
        ],
        "style": "default",
        "blocks": [
          "regform"
        ],
        "defaultContent": []
      }
    ]
  };

// TRANSFORMER REGISTRY - cleanup (strip sub-site chrome) then dynamic section reconstruction.
const transformers = [
  cleanupTransformer,
  sectionsDynamicTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try { transformerFn.call(null, hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (seen.has(element)) return;
        for (const existing of seen) { if (existing.contains(element) || element.contains(existing)) return; }
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try { parser(block.element, { document, url, params }); }
        catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
      } else { console.warn(`No parser found for block: ${block.name}`); }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  }
};
