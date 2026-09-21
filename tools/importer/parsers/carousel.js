/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: carousel
 * Base block: carousel (container block; child model: card)
 * Source: https://main--tvhc--dprevelige.aem.page/en/health-wellness
 * Project type: xwalk (field hints per blocks/carousel/_carousel.json + child model card)
 * Generated: 2026-09-21
 *
 * Structure (from library-description.txt): container block, one row per slide.
 *   The first row is the block name (added by createBlock). Each subsequent row
 *   is a single slide/card whose child model (`card`, per blocks/cards/_cards.json
 *   which backs the carousel filter) has fields: image, text, ctastyle.
 *
 *   Each card row has 2 cells (mirrors the validated cards.js convention):
 *     cell 1 -> field:image (image/picture; imageAlt collapses onto <img alt>)
 *     cell 2 -> field:text  (heading + description + CTA anchor as richtext)
 *
 *   The carousel MODEL fields (autoplay, autoplayInterval, imageZoom) have no
 *   authored values in the source (defaults), so no block-config rows are emitted.
 *
 * EXCLUDED:
 *   - .cards-config divs ("image-top", "cta-button"/"cta-link"): EDS runtime
 *     config. "image-top" has no card-model field; the cta-* values do not map
 *     to the ctastyle select options (button/button-secondary/button-dark), so
 *     emitting them would produce invalid select values. The CTA content itself
 *     is preserved inside .cards-card-body -> field:text.
 *   - .button-container next/prev buttons: client-side navigation controls
 *     rendered by the block JS, not authored content (they live outside <ul>).
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION — selectors validated against source.html.
  // Each slide is a top-level <li> inside the block's <ul>.
  const scoped = Array.from(element.querySelectorAll(':scope > ul > li'));
  const listItems = scoped.length ? scoped : Array.from(element.querySelectorAll('ul > li, li'));

  // Empty-block guard: nothing authored to import.
  if (listItems.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  listItems.forEach((li) => {
    // --- Image cell (field:image) ---
    // Image lives in .cards-card-image; prefer <picture>, else bare <img>.
    const imageContainer = li.querySelector('.cards-card-image') || li;
    const picture = imageContainer.querySelector('picture');
    const img = imageContainer.querySelector('img');
    const imageNode = picture || img;

    const imageCell = [];
    if (imageNode) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(imageNode);
    }
    // else: leave empty cell (no field hint on empty cells).

    // --- Text cell (field:text) — heading + description + CTA as richtext ---
    // Content lives in .cards-card-body. The .cards-config divs (image-top,
    // cta-*) are EDS config and are excluded by scoping to the body only.
    const body = li.querySelector('.cards-card-body');
    const textNodes = [];
    if (body) {
      Array.from(body.children).forEach((child) => {
        if (child.matches('h1, h2, h3, h4, h5, h6, p, ul, ol')) textNodes.push(child);
      });
    }

    const textCell = [];
    if (textNodes.length) {
      textCell.push(document.createComment(' field:text '));
      textNodes.forEach((n) => textCell.push(n));
    }

    // 2-column card row; include both cells even if one is empty.
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
