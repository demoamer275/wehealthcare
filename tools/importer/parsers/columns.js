/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns
 * Base block: columns
 * Source: https://main--tvhc--dprevelige.aem.page/en/insurance-plans, /en/member-resources
 * Project type: xwalk (blocks/columns/_columns.json)
 * Generated: 2026-09-21
 *
 * Structure (from library-description.txt): a grid block. First row = block name
 * (added by createBlock). Each subsequent row holds N cells, one per column, in a
 * layout row. Every row must have the same number of columns.
 *
 * FIELD HINTING: per hinting.md Rule 4, Columns blocks do NOT use field:* hints —
 * cells carry only their default content (text, images, inline elements). Do not
 * add HTML comments.
 *
 * Handles both authored layouts on the gap pages:
 *   - 2-col image + text (insurance-plans)
 *   - 3-col feature blurbs (member-resources)
 * Column count is derived from the source, not fixed, so mixed layouts survive.
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION — selectors validated against source.html.
  // The block root contains one <div> per layout row; each row's direct-child
  // <div>s are the individual columns/cells.
  const rowEls = Array.from(element.querySelectorAll(':scope > div'));

  // Empty-block guard: nothing authored to import.
  if (rowEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  rowEls.forEach((rowEl) => {
    const colEls = Array.from(rowEl.querySelectorAll(':scope > div'));

    // If a row has no inner column divs, treat the row itself as a single cell.
    const columns = colEls.length ? colEls : [rowEl];

    const row = columns.map((colEl) => {
      // Preserve the column's element children (picture, headings, paragraphs,
      // links) intact. Fall back to text content only if there are none.
      return colEl.children.length
        ? Array.from(colEl.children)
        : colEl.textContent.trim();
    });

    cells.push(row);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
