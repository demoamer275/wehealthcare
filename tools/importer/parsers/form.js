/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: form
 * Base block: form (Adobe Adaptive Form — block ALREADY EXISTS at blocks/form)
 * Source: https://main--tvhc--dprevelige.aem.page/en/pharma/neuropax/prescribers
 * Project type: xwalk.
 * Generated: 2026-09-21
 *
 * How the form block consumes its definition (blocks/form/form.js decorate()):
 *   1. An anchor `a[href]` whose href points at the form JSON / form model, OR
 *   2. An encoded Adaptive Form definition inside `<pre><code> ... </code></pre>`
 *      (extractFormDefinition -> decode -> JSON.parse).
 * Either shape must survive import so the existing block can hydrate the form.
 *
 * Source DOM (validated against migration-work/block-context/form/source.html):
 *   .form.block > div > div > form   (empty at rest — the form is hydrated at
 *   runtime from the definition, which is NOT present in the delivered snapshot).
 *
 * Strategy — preserve the authored definition INTACT, in priority order:
 *   1. If a `<pre><code>` encoded payload exists, keep it verbatim (the block's
 *      extractFormDefinition reads block.querySelector('pre') > code.textContent).
 *   2. Else if an `a[href]` form link exists, keep the anchor (decorate() reads
 *      block.querySelector('a[href]') and fetches it).
 *   3. Else emit a single-cell block referencing the form's action/path if any is
 *      discoverable, so the block is still authored and a developer can supply the
 *      definition later. Never fabricate a payload.
 *
 * Output: 1-column block (form is a single-cell container block).
 */
export default function parse(element, { document }) {
  const cells = [];

  // 1) Encoded payload inside <pre><code> — preserve verbatim, do not touch content.
  const pre = element.querySelector('pre');
  const code = pre ? pre.querySelector('code') : null;
  if (pre && code && code.textContent && code.textContent.trim().length > 0) {
    cells.push([pre]); // 1-column: one row, one cell holding the encoded payload intact
    const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
    element.replaceWith(block);
    return;
  }

  // 2) Form-definition link — preserve the anchor so decorate() can fetch it.
  const link = Array.from(element.querySelectorAll('a[href]')).find((a) => {
    const href = a.getAttribute('href') || '';
    return href.length > 0 && href !== '#';
  });
  if (link) {
    cells.push([link]); // 1-column
    const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
    element.replaceWith(block);
    return;
  }

  // 3) Fallback — no inline definition or link in the delivered snapshot (the
  //    adaptive form hydrates at runtime). Reference the form action/path if the
  //    <form> exposes one, otherwise emit an empty authored form block so a
  //    developer can attach the definition later.
  const form = element.querySelector('form');
  const action = form ? (form.getAttribute('action') || form.getAttribute('data-action') || '') : '';
  if (action) {
    const a = document.createElement('a');
    a.href = action;
    a.textContent = action;
    cells.push([a]); // 1-column
  } else {
    cells.push(['']); // empty authored form block (single cell)
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
