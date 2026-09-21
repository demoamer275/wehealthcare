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

  // tools/importer/import-health-wellness.js
  var import_health_wellness_exports = {};
  __export(import_health_wellness_exports, {
    default: () => import_health_wellness_default
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

  // tools/importer/parsers/carousel.js
  function parse2(element, { document: document2 }) {
    const scoped = Array.from(element.querySelectorAll(":scope > ul > li"));
    const listItems = scoped.length ? scoped : Array.from(element.querySelectorAll("ul > li, li"));
    if (listItems.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    listItems.forEach((li) => {
      const imageContainer = li.querySelector(".cards-card-image") || li;
      const picture = imageContainer.querySelector("picture");
      const img = imageContainer.querySelector("img");
      const imageNode = picture || img;
      const imageCell = [];
      if (imageNode) {
        imageCell.push(document2.createComment(" field:image "));
        imageCell.push(imageNode);
      }
      const body = li.querySelector(".cards-card-body");
      const textNodes = [];
      if (body) {
        Array.from(body.children).forEach((child) => {
          if (child.matches("h1, h2, h3, h4, h5, h6, p, ul, ol")) textNodes.push(child);
        });
      }
      const textCell = [];
      if (textNodes.length) {
        textCell.push(document2.createComment(" field:text "));
        textNodes.forEach((n) => textCell.push(n));
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document: document2 }) {
    const rowEls = Array.from(element.querySelectorAll(":scope > div"));
    if (rowEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    rowEls.forEach((rowEl) => {
      const colEls = Array.from(rowEl.querySelectorAll(":scope > div"));
      const columns = colEls.length ? colEls : [rowEl];
      const row = columns.map((colEl) => {
        return colEl.children.length ? Array.from(colEl.children) : colEl.textContent.trim();
      });
      cells.push(row);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns", cells });
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

  // tools/importer/transformers/wehealthcare-sections-dynamic.js
  var DEFAULTS = {
    "sec-spacing": "section-none",
    "sec-spacing-bottom": "section-none",
    "sec-full-width": "false"
  };
  function styleFromClass(el) {
    if (el.classList.contains("bg-light")) return "bg-light";
    if (el.classList.contains("bg-default")) return "bg-default";
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const main = element.querySelector("main") || element;
    const sections = [...main.children].filter(
      (c) => c.tagName === "DIV" && c.classList.contains("section")
    );
    if (sections.length === 0) return;
    sections.forEach((section, i) => {
      if (i > 0) {
        const hr = document.createElement("hr");
        section.before(hr);
      }
      const cells = {};
      const style = styleFromClass(section);
      if (style) cells.style = style;
      const spacing = section.getAttribute("data-sec-spacing");
      if (spacing && spacing !== DEFAULTS["sec-spacing"]) cells["sec-spacing"] = spacing;
      const spacingBottom = section.getAttribute("data-sec-spacing-bottom");
      if (spacingBottom && spacingBottom !== DEFAULTS["sec-spacing-bottom"]) {
        cells["sec-spacing-bottom"] = spacingBottom;
      }
      const fullWidth = section.getAttribute("data-sec-full-width");
      if (fullWidth && fullWidth !== DEFAULTS["sec-full-width"]) cells["sec-full-width"] = fullWidth;
      if (Object.keys(cells).length === 0) return;
      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: "Section Metadata",
        cells
      });
      section.append(metadataBlock);
    });
  }

  // tools/importer/import-health-wellness.js
  var parsers = {
    hero: parse,
    carousel: parse2,
    columns: parse3
  };
  var PAGE_TEMPLATE = {
    name: "health-wellness",
    description: "Health & wellness content pages: hero bands, an image-card carousel, and 2/3-column feature sections.",
    urls: [
      "https://main--tvhc--dprevelige.aem.page/en/health-wellness",
      "https://main--tvhc--dprevelige.aem.page/en/insurance-plans",
      "https://main--tvhc--dprevelige.aem.page/en/member-resources"
    ],
    blocks: [
      {
        name: "hero",
        instances: [".hero-wrapper .hero.block", ".hero.block"]
      },
      {
        name: "carousel",
        instances: [".carousel-wrapper .carousel.block", ".carousel.block"]
      },
      {
        name: "columns",
        instances: [".columns-wrapper .columns.block", ".columns.block"]
      }
    ]
  };
  var transformers = [
    transform,
    transform2
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
  var import_health_wellness_default = {
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
  return __toCommonJS(import_health_wellness_exports);
})();
