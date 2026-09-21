/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wehealthcare-cleanup.js';
import sectionsTransformer from './transformers/wehealthcare-sections.js';

// PARSER REGISTRY
const parsers = {
  hero: heroParser,
  cards: cardsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Homepage: full-bleed hero, intro text, two card rows, and a find-a-doctor hero band.',
  urls: [
    'https://main--tvhc--dprevelige.aem.page/',
  ],
  blocks: [
    {
      name: 'hero',
      instances: ['.section.hero-container .hero.block', '.hero.block'],
    },
    {
      name: 'cards',
      instances: ['.cards-wrapper .cards.block', '.cards.block'],
    },
  ],
  sections: [
    {
      id: 'rc1',
      name: 'hero-full-bleed',
      selector: ['.section.hero-container:nth-of-type(1)', 'main > .section.hero-container:first-of-type'],
      style: null,
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'rc2',
      name: 'intro-text',
      selector: ['.section.bg-default.cards-container > .default-content-wrapper', '.cards-container .default-content-wrapper'],
      style: null,
      blocks: [],
      defaultContent: ['.default-content-wrapper h1', '.default-content-wrapper p'],
    },
    {
      id: 'rc3',
      name: 'cards-row-1',
      selector: ['.section.bg-default.cards-container > .cards-wrapper:nth-of-type(2)', '.cards-container .cards-wrapper:nth-of-type(1)'],
      style: null,
      blocks: ['cards'],
      defaultContent: [],
    },
    {
      id: 'rc4',
      name: 'cards-row-2',
      selector: ['.section.bg-default.cards-container > .cards-wrapper:nth-of-type(3)', '.cards-container .cards-wrapper:nth-of-type(2)'],
      style: null,
      blocks: ['cards'],
      defaultContent: [],
    },
    {
      id: 'rc5',
      name: 'find-doctor-hero',
      selector: ['.section.bg-light.hero-container', 'main > .section.bg-light'],
      style: 'light',
      blocks: ['hero'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then sections (afterTransform)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (seen.has(element)) return; // dedupe elements matched by multiple selectors
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Built-in importer rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (root → /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
