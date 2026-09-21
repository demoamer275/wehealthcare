/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import formParser from './parsers/form.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wehealthcare-cleanup.js';
import sectionsDynamicTransformer from './transformers/neuropax-sections-dynamic.js';

// PARSER REGISTRY
const parsers = {
  'form': formParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
    "name": "neuropax-prescribers",
    "description": "NeuroPax prescribers: an Adobe Adaptive Form plus a short prescriber-info note.",
    "urls": [
      "https://main--tvhc--dprevelige.aem.page/en/pharma/neuropax/prescribers"
    ],
    "blocks": [
      {
        "name": "form",
        "instances": [
          ".form-wrapper .form.block",
          ".form.block",
          ".form-container .form"
        ]
      }
    ],
    "sections": [
      {
        "id": "rc1",
        "name": "lead-spacing",
        "selector": [
          ".section.bg-default:nth-of-type(1)",
          "main > .section.bg-default"
        ],
        "style": "bg-default",
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "rc2",
        "name": "form-section",
        "selector": [
          ".section.default.form-container",
          "main > .section.form-container"
        ],
        "style": "default",
        "blocks": [
          "form"
        ],
        "defaultContent": [
          ".form-container p"
        ]
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
