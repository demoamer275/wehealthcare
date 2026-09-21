/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cfteaser
 * Base block: cfteaser (custom crosswalk content-fragment teaser — NOT yet in this repo)
 * Source: https://main--tvhc--dprevelige.aem.page/en/pharma/neuropax
 * Project type: xwalk. NOTE: no model file (blocks/cfteaser/_cfteaser.json)
 *   exists yet, so no field hints are emitted.
 * Generated: 2026-09-21
 *
 * Source DOM (validated against migration-work/block-context/cfteaser/source.html):
 *   .cfteaser.block
 *     .cfteaser-overlay
 *       .cfteaser-image > img.asset-image   (base64 data-URI — runtime-hydrated CF asset)
 *       .cfteaser-body
 *         h3                                 (heading)
 *         p ...                              (description; empty <p>s present)
 *         .button-container.cta-button-cf > a.button   (CTA)
 *
 * 🚨 The .cfteaser-image img carries a huge base64 data: URI that is hydrated at
 *    runtime from the referenced content fragment. We DO NOT emit the base64 into
 *    the block table. Instead we reference the CF (path + heading + description +
 *    CTA). If a real CF path is discoverable (a[href] into /content/dam .../fragments,
 *    or a data-* attribute), we record it as the Content Fragment row; the inline
 *    base64 <img> is always dropped.
 *
 * The block may contain multiple teasers (side-by-side layout); each
 * .cfteaser-overlay is emitted as its own set of label/value rows.
 *
 * Output: 2-column label/value table (every row has exactly 2 cells).
 */
export default function parse(element, { document }) {
  // A block may hold one or more teasers; fall back to the block itself.
  let teasers = Array.from(element.querySelectorAll('.cfteaser-overlay'));
  if (teasers.length === 0) teasers = [element];

  const hasText = (el) => el && el.textContent && el.textContent.trim().length > 0;

  const cells = [];
  const addRow = (label, value) => cells.push([label, value]);

  let captured = 0;
  teasers.forEach((teaser) => {
    const heading = teaser.querySelector('.cfteaser-body h1, .cfteaser-body h2, .cfteaser-body h3, .cfteaser-body h4, h3, h2');
    // Description: non-empty paragraphs inside the body, excluding the CTA container.
    const descParas = Array.from(teaser.querySelectorAll('.cfteaser-body > p'))
      .filter((p) => hasText(p));
    const cta = teaser.querySelector('.cta-button-cf a, .button-container a, a.button');

    // Resolve a content-fragment reference WITHOUT the base64 image:
    //  - explicit data-* attribute on any node, OR
    //  - an anchor/link into a DAM fragments path.
    let cfRef = teaser.querySelector('[data-cf-path], [data-fragment-path], [data-aue-resource]');
    let cfPath = '';
    if (cfRef) {
      cfPath = cfRef.getAttribute('data-cf-path')
        || cfRef.getAttribute('data-fragment-path')
        || cfRef.getAttribute('data-aue-resource') || '';
    }
    if (!cfPath) {
      const damLink = Array.from(teaser.querySelectorAll('a[href]'))
        .find((a) => /\/content\/dam\/[^"']*fragments/i.test(a.getAttribute('href') || ''));
      if (damLink) cfPath = damLink.getAttribute('href');
    }

    // Empty-teaser guard: skip teasers with no meaningful content.
    if (!hasText(heading) && descParas.length === 0 && !cta && !cfPath) return;
    captured += 1;

    if (hasText(heading)) addRow('Heading', heading);
    descParas.forEach((p) => addRow('Description', p));
    if (cta) addRow('CTA', cta);
    if (cfPath) {
      const p = document.createElement('p');
      p.textContent = cfPath;
      addRow('Content Fragment', p);
    }
    // Note: .cfteaser-image img (base64 data URI) is intentionally omitted.
  });

  // Empty-block guard: nothing meaningful to import.
  if (captured === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cfteaser', cells });
  element.replaceWith(block);
}
