/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cfteaserParser from './parsers/cfteaser.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wehealthcare-cleanup.js';
import sectionsDynamicTransformer from './transformers/neuropax-sections-dynamic.js';

// PARSER REGISTRY
const parsers = {
  hero: heroParser,
  cfteaser: cfteaserParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'neuropax-event-landing',
  description: 'NeuroPax event landing: a hero band above a content-fragment teaser.',
  urls: [
    'https://main--tvhc--dprevelige.aem.page/en/pharma/neuropax/events/event-landing',
  ],
  blocks: [
    { name: 'hero', instances: ['.hero-wrapper .hero.block', '.hero.block'] },
    { name: 'cfteaser', instances: ['.cfteaser-wrapper .cfteaser.block', '.cfteaser.block'] },
  ],
  sections: [
    { id: 'rc1', name: 'hero', selector: ['.section.hero-container', 'main > .section.hero-container'], style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'rc2', name: 'cf-teaser', selector: ['.section.default.cfteaser-container', 'main > .section.cfteaser-container'], style: 'default', blocks: ['cfteaser'], defaultContent: [] },
  ],
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
        pageBlocks.push({ name: blockDef.name, selector, element });
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

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
