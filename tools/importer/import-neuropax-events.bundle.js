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

  // tools/importer/import-neuropax-events.js
  var import_neuropax_events_exports = {};
  __export(import_neuropax_events_exports, {
    default: () => import_neuropax_events_default
  });

  // tools/importer/parsers/textblock.js
  function parse(element, { document: document2 }) {
    const content = element.querySelector(".textblock-content") || element.querySelector(".textblock-inner") || element;
    const contentNodes = Array.from(content.children).filter((child) => child.matches("h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote"));
    const classes = Array.from(element.classList);
    const alignClass = classes.find((c) => c.startsWith("textblock-align-"));
    const widthClass = classes.find((c) => c.startsWith("textblock-width-"));
    const align = alignClass ? alignClass.replace("textblock-align-", "") : "";
    const width = widthClass ? widthClass.replace("textblock-width-", "") : "";
    if (contentNodes.length === 0 && !align && !width) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (align) cells.push([`Align: ${align}`]);
    if (width) cells.push([`Width: ${width}`]);
    if (contentNodes.length > 0) {
      cells.push([contentNodes]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "textblock", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/regform.js
  function parse2(element, { document: document2 }) {
    const form = element.querySelector("form.regform-form, form") || element;
    const fields = Array.from(form.querySelectorAll(".regform-field"));
    if (fields.length === 0 && !form.querySelector(".regform-submit, button")) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const layoutOf = (fieldEl) => {
      const c = Array.from(fieldEl.classList);
      if (c.includes("single-col")) return "single-col";
      if (c.includes("double-col")) return "double-col";
      if (c.includes("triple-col")) return "triple-col";
      if (c.includes("hidden-field")) return "hidden-field";
      return "";
    };
    const cells = [];
    fields.forEach((fieldEl) => {
      const labelEl = fieldEl.querySelector("label");
      let labelText = "";
      if (labelEl) {
        const clone = labelEl.cloneNode(true);
        clone.querySelectorAll(".regform-required").forEach((s) => s.remove());
        labelText = clone.textContent.trim();
      }
      const select = fieldEl.querySelector("select");
      const input = fieldEl.querySelector("input, textarea");
      const required = !!fieldEl.querySelector(".regform-required");
      const layout = layoutOf(fieldEl);
      const labelCell = document2.createElement("p");
      labelCell.textContent = labelText || (select ? select.id : input ? input.id : "field");
      const type = select ? "select" : input ? input.tagName.toLowerCase() : "field";
      const metaCell = [];
      const typeP = document2.createElement("p");
      typeP.textContent = `Type: ${type}`;
      metaCell.push(typeP);
      if (layout) {
        const layoutP = document2.createElement("p");
        layoutP.textContent = `Layout: ${layout}`;
        metaCell.push(layoutP);
      }
      const reqP = document2.createElement("p");
      reqP.textContent = `Required: ${required ? "yes" : "no"}`;
      metaCell.push(reqP);
      let optionsCell = "";
      if (select) {
        const opts = Array.from(select.querySelectorAll("option")).map((o) => o.textContent.trim()).filter(Boolean);
        if (opts.length > 0) {
          const ul = document2.createElement("ul");
          opts.forEach((o) => {
            const li = document2.createElement("li");
            li.textContent = o;
            ul.appendChild(li);
          });
          optionsCell = ul;
        }
      }
      cells.push([labelCell, metaCell, optionsCell]);
    });
    const submit = form.querySelector('.regform-submit, .regform-actions button, button[type="submit"], button');
    if (submit) {
      const submitLabel = document2.createElement("p");
      submitLabel.textContent = "Submit";
      const submitMeta = document2.createElement("p");
      submitMeta.textContent = (submit.textContent || "Submit").trim();
      cells.push([submitLabel, submitMeta, ""]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "regform", cells });
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

  // tools/importer/import-neuropax-events.js
  var parsers = {
    "textblock": parse,
    "regform": parse2
  };
  var PAGE_TEMPLATE = {
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
  var import_neuropax_events_default = {
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
  return __toCommonJS(import_neuropax_events_exports);
})();
