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

  // tools/importer/import-neuropax-prescribers.js
  var import_neuropax_prescribers_exports = {};
  __export(import_neuropax_prescribers_exports, {
    default: () => import_neuropax_prescribers_default
  });

  // tools/importer/parsers/form.js
  function parse(element, { document: document2 }) {
    const cells = [];
    const pre = element.querySelector("pre");
    const code = pre ? pre.querySelector("code") : null;
    if (pre && code && code.textContent && code.textContent.trim().length > 0) {
      cells.push([pre]);
      const block2 = WebImporter.Blocks.createBlock(document2, { name: "form", cells });
      element.replaceWith(block2);
      return;
    }
    const link = Array.from(element.querySelectorAll("a[href]")).find((a) => {
      const href = a.getAttribute("href") || "";
      return href.length > 0 && href !== "#";
    });
    if (link) {
      cells.push([link]);
      const block2 = WebImporter.Blocks.createBlock(document2, { name: "form", cells });
      element.replaceWith(block2);
      return;
    }
    const form = element.querySelector("form");
    const action = form ? form.getAttribute("action") || form.getAttribute("data-action") || "" : "";
    if (action) {
      const a = document2.createElement("a");
      a.href = action;
      a.textContent = action;
      cells.push([a]);
    } else {
      cells.push([""]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "form", cells });
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

  // tools/importer/transformers/neuropax-sections-dynamic.js
  var KEY_MAP = [
    { attr: "data-sec-spacing", key: "sec-spacing", skip: "section-none" },
    { attr: "data-sec-spacing-bottom", key: "sec-spacing-bottom", skip: "section-none" },
    { attr: "data-sec-swoosh", key: "sec-swoosh", skip: "sec-swoosh-none" },
    { attr: "data-sec-layout", key: "sec-layout", skip: null }
  ];
  function styleFromClass(el) {
    if (el.classList.contains("bg-light")) return "bg-light";
    if (el.classList.contains("bg-default")) return "bg-default";
    if (el.classList.contains("default")) return "default";
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
      KEY_MAP.forEach(({ attr, key, skip }) => {
        const val = section.getAttribute(attr);
        if (val && (skip === null || val !== skip)) cells[key] = val;
      });
      if (Object.keys(cells).length === 0) return;
      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: "Section Metadata",
        cells
      });
      section.append(metadataBlock);
    });
  }

  // tools/importer/import-neuropax-prescribers.js
  var parsers = {
    "form": parse
  };
  var PAGE_TEMPLATE = {
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
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
          for (const existing of seen) {
            if (existing.contains(element) || element.contains(existing)) return;
          }
          seen.add(element);
          pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_neuropax_prescribers_default = {
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
      return [{ element: main, path, report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
    }
  };
  return __toCommonJS(import_neuropax_prescribers_exports);
})();
