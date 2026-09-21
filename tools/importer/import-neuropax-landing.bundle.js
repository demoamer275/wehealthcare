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

  // tools/importer/import-neuropax-landing.js
  var import_neuropax_landing_exports = {};
  __export(import_neuropax_landing_exports, {
    default: () => import_neuropax_landing_default
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

  // tools/importer/parsers/defaultoffer.js
  function parse2(element, { document: document2 }) {
    const image = element.querySelector(".offerblock-image img, img");
    const caption = element.querySelector(".offerblock-image div p, .offerblock-image figcaption");
    const title = element.querySelector(".offerblock-content--title p, .offerblock-content--title");
    const subtitle = element.querySelector(".offerblock-content--subtitle p, .offerblock-content--subtitle");
    const date = element.querySelector(".offerblock-content--date p, .offerblock-content--date");
    const location = element.querySelector(".offerblock-content--location p, .offerblock-content--location");
    const cta = element.querySelector(".offerblock-content--cta a, a.offerblock-content--cta-btn");
    const hasText = (el) => el && el.textContent && el.textContent.trim().length > 0;
    if (!image && !hasText(title) && !hasText(subtitle) && !cta) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const addRow = (label, valueEl) => {
      cells.push([label, valueEl]);
    };
    if (image) addRow("Image", image);
    if (hasText(caption)) addRow("Caption", caption);
    if (hasText(title)) addRow("Title", title);
    if (hasText(subtitle)) addRow("Subtitle", subtitle);
    if (hasText(date)) addRow("Date", date);
    if (hasText(location)) addRow("Location", location);
    if (cta) addRow("CTA", cta);
    const block = WebImporter.Blocks.createBlock(document2, { name: "defaultoffer", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/textblock.js
  function parse3(element, { document: document2 }) {
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

  // tools/importer/parsers/cfteaser.js
  function parse4(element, { document: document2 }) {
    let teasers = Array.from(element.querySelectorAll(".cfteaser-overlay"));
    if (teasers.length === 0) teasers = [element];
    const hasText = (el) => el && el.textContent && el.textContent.trim().length > 0;
    const cells = [];
    const addRow = (label, value) => cells.push([label, value]);
    let captured = 0;
    teasers.forEach((teaser) => {
      const heading = teaser.querySelector(".cfteaser-body h1, .cfteaser-body h2, .cfteaser-body h3, .cfteaser-body h4, h3, h2");
      const descParas = Array.from(teaser.querySelectorAll(".cfteaser-body > p")).filter((p) => hasText(p));
      const cta = teaser.querySelector(".cta-button-cf a, .button-container a, a.button");
      let cfRef = teaser.querySelector("[data-cf-path], [data-fragment-path], [data-aue-resource]");
      let cfPath = "";
      if (cfRef) {
        cfPath = cfRef.getAttribute("data-cf-path") || cfRef.getAttribute("data-fragment-path") || cfRef.getAttribute("data-aue-resource") || "";
      }
      if (!cfPath) {
        const damLink = Array.from(teaser.querySelectorAll("a[href]")).find((a) => /\/content\/dam\/[^"']*fragments/i.test(a.getAttribute("href") || ""));
        if (damLink) cfPath = damLink.getAttribute("href");
      }
      if (!hasText(heading) && descParas.length === 0 && !cta && !cfPath) return;
      captured += 1;
      if (hasText(heading)) addRow("Heading", heading);
      descParas.forEach((p) => addRow("Description", p));
      if (cta) addRow("CTA", cta);
      if (cfPath) {
        const p = document2.createElement("p");
        p.textContent = cfPath;
        addRow("Content Fragment", p);
      }
    });
    if (captured === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cfteaser", cells });
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

  // tools/importer/import-neuropax-landing.js
  var parsers = {
    "hero": parse,
    "defaultoffer": parse2,
    "textblock": parse3,
    "cfteaser": parse4
  };
  var PAGE_TEMPLATE = {
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
  var import_neuropax_landing_default = {
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
  return __toCommonJS(import_neuropax_landing_exports);
})();
