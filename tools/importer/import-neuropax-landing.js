/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import defaultofferParser from './parsers/defaultoffer.js';
import textblockParser from './parsers/textblock.js';
import cfteaserParser from './parsers/cfteaser.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wehealthcare-cleanup.js';
import sectionsDynamicTransformer from './transformers/neuropax-sections-dynamic.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'defaultoffer': defaultofferParser,
  'textblock': textblockParser,
  'cfteaser': cfteaserParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
    "name": "neuropax-landing",
    "description": "NeuroPax landing: hero, an offer block + intro textblock, and a row of content-fragment teasers.",
    "urls": [
      "https://main--tvhc--dprevelige.aem.page/en/pharma/neuropax"
    ],
    "blocks": [
      {
        "name": "hero",
        "instances": [
          ".hero-wrapper .hero.block",
          ".hero.block"
        ]
      },
      {
        "name": "defaultoffer",
        "instances": [
          ".defaultoffer-wrapper .defaultoffer.block",
          ".defaultoffer.block"
        ]
      },
      {
        "name": "textblock",
        "instances": [
          ".textblock-wrapper .textblock.block",
          ".textblock.block"
        ]
      },
      {
        "name": "cfteaser",
        "instances": [
          ".cfteaser-wrapper .cfteaser.block",
          ".cfteaser.block"
        ]
      }
    ],
    "sections": [
      {
        "id": "rc1",
        "name": "hero",
        "selector": [
          ".section.hero-container",
          "main > .section.hero-container"
        ],
        "style": null,
        "blocks": [
          "hero"
        ],
        "defaultContent": []
      },
      {
        "id": "rc2",
        "name": "offer-intro",
        "selector": [
          ".section.defaultoffer-container.textblock-container",
          "main > .section.defaultoffer-container"
        ],
        "style": "default",
        "blocks": [
          "defaultoffer",
          "textblock"
        ],
        "defaultContent": []
      },
      {
        "id": "rc3",
        "name": "cf-teasers",
        "selector": [
          ".section.cfteaser-container",
          "main > .section.cfteaser-container"
        ],
        "style": "sidebyside",
        "blocks": [
          "cfteaser"
        ],
        "defaultContent": []
      },
      {
        "id": "rc4",
        "name": "trailing",
        "selector": [
          ".section.default:nth-of-type(4)",
          "main > .section.default:last-of-type"
        ],
        "style": "default",
        "blocks": [],
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
