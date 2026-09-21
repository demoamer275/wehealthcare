/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const picture = element.querySelector("picture");
    const img = element.querySelector("img");
    const firstHeading = element.querySelector("h1, h2, h3, h4, h5, h6");
    const contentCell = firstHeading ? firstHeading.parentElement : null;
    const textNodes = [];
    if (contentCell) {
      Array.from(contentCell.children).forEach((child) => {
        if (child.matches("h1, h2, h3, h4, h5, h6, p")) textNodes.push(child);
      });
    }
    if (!picture && !img && textNodes.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const imageNode = picture || img;
    if (imageNode) {
      const imageCell = [];
      imageCell.push(document2.createComment(" field:image "));
      imageCell.push(imageNode);
      cells.push([imageCell]);
    }
    const textCell = [];
    textCell.push(document2.createComment(" field:text "));
    textNodes.forEach((n) => textCell.push(n));
    if (textCell.length > 1) {
      cells.push([textCell]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(":scope > ul > li"));
    const listItems = items.length ? items : Array.from(element.querySelectorAll("li"));
    if (listItems.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    listItems.forEach((li) => {
      const imageContainer = li.querySelector(".cards-card-image");
      const picture = (imageContainer || li).querySelector("picture");
      const img = (imageContainer || li).querySelector("img");
      const imageNode = picture || img;
      const imageCell = [];
      if (imageNode) {
        imageCell.push(document2.createComment(" field:image "));
        imageCell.push(imageNode);
      }
      const body = li.querySelector(".cards-card-body");
      const textCell = [];
      const textNodes = [];
      if (body) {
        Array.from(body.children).forEach((child) => {
          if (child.matches("h1, h2, h3, h4, h5, h6, p, ul, ol")) textNodes.push(child);
        });
      }
      if (textNodes.length) {
        textCell.push(document2.createComment(" field:text "));
        textNodes.forEach((n) => textCell.push(n));
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wehealthcare-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.header-wrapper",
        "footer.footer-wrapper",
        "header",
        "footer"
      ]);
    }
  }

  // tools/importer/transformers/wehealthcare-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    hero: parse,
    cards: parse2
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Homepage: full-bleed hero, intro text, two card rows, and a find-a-doctor hero band.",
    urls: [
      "https://main--tvhc--dprevelige.aem.page/"
    ],
    blocks: [
      {
        name: "hero",
        instances: [".section.hero-container .hero.block", ".hero.block"]
      },
      {
        name: "cards",
        instances: [".cards-wrapper .cards.block", ".cards.block"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "hero-full-bleed",
        selector: [".section.hero-container:nth-of-type(1)", "main > .section.hero-container:first-of-type"],
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "rc2",
        name: "intro-text",
        selector: [".section.bg-default.cards-container > .default-content-wrapper", ".cards-container .default-content-wrapper"],
        style: null,
        blocks: [],
        defaultContent: [".default-content-wrapper h1", ".default-content-wrapper p"]
      },
      {
        id: "rc3",
        name: "cards-row-1",
        selector: [".section.bg-default.cards-container > .cards-wrapper:nth-of-type(2)", ".cards-container .cards-wrapper:nth-of-type(1)"],
        style: null,
        blocks: ["cards"],
        defaultContent: []
      },
      {
        id: "rc4",
        name: "cards-row-2",
        selector: [".section.bg-default.cards-container > .cards-wrapper:nth-of-type(3)", ".cards-container .cards-wrapper:nth-of-type(2)"],
        style: null,
        blocks: ["cards"],
        defaultContent: []
      },
      {
        id: "rc5",
        name: "find-doctor-hero",
        selector: [".section.bg-light.hero-container", "main > .section.bg-light"],
        style: "light",
        blocks: ["hero"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
