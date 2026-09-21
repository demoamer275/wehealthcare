/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: textblock
 * Base block: textblock (custom crosswalk block — NOT yet in this repo)
 * Source: https://main--tvhc--dprevelige.aem.page/en/pharma/neuropax
 * Project type: xwalk. NOTE: no model file (blocks/textblock/_textblock.json)
 *   exists yet, so no field hints are emitted.
 * Generated: 2026-09-21
 *
 * Source DOM (validated against migration-work/block-context/textblock/source.html):
 *   .textblock.block.textblock-align-{center|left}.textblock-width-{70|100}
 *     .textblock-inner
 *       .textblock-content
 *         h1 > strong, h3 > strong, p ... (authored rich text)
 *
 * The variant class carries alignment/width hints. We preserve them as config
 * rows (Align / Width) and place the authored heading/text as a single richtext
 * content cell so the styled container is reproduced faithfully.
 *
 * Output: 1-column block. Config rows carry alignment/width; final row holds
 *   the rich text content (heading levels preserved).
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION — selectors validated against source.html
  const content = element.querySelector('.textblock-content')
    || element.querySelector('.textblock-inner')
    || element;

  // Collect authored rich-text nodes (headings + paragraphs) in document order.
  const contentNodes = Array.from(content.children).filter((child) =>
    child.matches('h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote'));

  // Derive alignment/width from the variant classes on the block element.
  const classes = Array.from(element.classList);
  const alignClass = classes.find((c) => c.startsWith('textblock-align-'));
  const widthClass = classes.find((c) => c.startsWith('textblock-width-'));
  const align = alignClass ? alignClass.replace('textblock-align-', '') : '';
  const width = widthClass ? widthClass.replace('textblock-width-', '') : '';

  // Empty-block guard: nothing meaningful to import.
  if (contentNodes.length === 0 && !align && !width) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // OUTPUT — 1-column block. Config rows first, then the rich-text content cell.
  const cells = [];
  if (align) cells.push([`Align: ${align}`]);
  if (width) cells.push([`Width: ${width}`]);

  if (contentNodes.length > 0) {
    cells.push([contentNodes]); // 1-column: one row, one cell holding all rich-text nodes
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'textblock', cells });
  element.replaceWith(block);
}
