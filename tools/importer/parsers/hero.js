/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero
 * Base block: hero
 * Source: https://main--tvhc--dprevelige.aem.page/
 * Project type: xwalk (field hints per blocks/hero/_hero.json)
 * Generated: 2026-09-21
 *
 * Structure (from library-description.txt): 1 column.
 *   Row: block name (added by createBlock)
 *   Row: background image        -> field:image  (imageAlt collapses onto <img alt>)
 *   Row: title + subheading + CTA -> field:text  (richtext)
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION — selectors validated against source.html
  // Background/asset image. Prefer <picture>, fall back to bare <img>.
  const picture = element.querySelector('picture');
  const img = element.querySelector('img');

  // Text content lives together in a single inner cell: title (heading),
  // optional subheading (p), and optional CTA (p.button-container). The EDS
  // config values (herolayout, enableunderline, ctastyle -> "false", "button",
  // "image-left", ...) render as <p> in SEPARATE sibling cells, so scoping to
  // the heading's own cell excludes them automatically.
  const firstHeading = element.querySelector('h1, h2, h3, h4, h5, h6');
  const contentCell = firstHeading ? firstHeading.parentElement : null;

  // Collect title/subheading/CTA nodes in document order from the content cell.
  const textNodes = [];
  if (contentCell) {
    Array.from(contentCell.children).forEach((child) => {
      if (child.matches('h1, h2, h3, h4, h5, h6, p')) textNodes.push(child);
    });
  }

  // Empty-block guard: nothing meaningful to import.
  if (!picture && !img && textNodes.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // --- Image row (field:image) ---
  const imageNode = picture || img;
  if (imageNode) {
    const imageCell = [];
    imageCell.push(document.createComment(' field:image '));
    imageCell.push(imageNode);
    cells.push([imageCell]); // 1-column block: one row, one cell
  }

  // --- Text row (field:text) — title, subheading, CTA as richtext ---
  const textCell = [];
  textCell.push(document.createComment(' field:text '));
  textNodes.forEach((n) => textCell.push(n));
  if (textCell.length > 1) {
    cells.push([textCell]); // 1-column block: one row, one cell
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
