/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards
 * Base block: cards (container block; child model: card)
 * Source: https://main--tvhc--dprevelige.aem.page/
 * Project type: xwalk (field hints per blocks/cards/_cards.json)
 * Generated: 2026-09-21
 *
 * Structure (from library-description.txt): container block, one row per card.
 *   Each card row has 2 cells:
 *     cell 1 -> field:image (image or icon; imageAlt collapses onto <img alt>)
 *     cell 2 -> field:text  (heading + description + CTA as richtext)
 *   An image or text cell may be empty, but the cell must still be included.
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION — selectors validated against source.html.
  // Each card is a top-level <li> in the block's <ul>.
  const items = Array.from(element.querySelectorAll(':scope > ul > li'));
  const listItems = items.length ? items : Array.from(element.querySelectorAll('li'));

  // Empty-block guard.
  if (listItems.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  listItems.forEach((li) => {
    // --- Image cell (field:image) ---
    // The image lives in .cards-card-image (prefer <picture>, else <img>).
    const imageContainer = li.querySelector('.cards-card-image');
    const picture = (imageContainer || li).querySelector('picture');
    const img = (imageContainer || li).querySelector('img');
    const imageNode = picture || img;

    const imageCell = [];
    if (imageNode) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(imageNode);
    }
    // else: leave empty cell (no field hint on empty cells).

    // --- Text cell (field:text) — heading + description + CTA ---
    // Content lives in .cards-card-body. The .cards-config divs (image-top,
    // cta-button) are EDS config, excluded by scoping to the body.
    const body = li.querySelector('.cards-card-body');
    const textCell = [];
    const textNodes = [];
    if (body) {
      Array.from(body.children).forEach((child) => {
        if (child.matches('h1, h2, h3, h4, h5, h6, p, ul, ol')) textNodes.push(child);
      });
    }
    if (textNodes.length) {
      textCell.push(document.createComment(' field:text '));
      textNodes.forEach((n) => textCell.push(n));
    }

    // 2-column row; include both cells even if one is empty.
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
