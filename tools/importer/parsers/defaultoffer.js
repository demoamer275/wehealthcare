/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: defaultoffer
 * Base block: defaultoffer (custom crosswalk block — NOT yet in this repo)
 * Source: https://main--tvhc--dprevelige.aem.page/en/pharma/neuropax
 * Project type: xwalk. NOTE: no model file (blocks/defaultoffer/_defaultoffer.json)
 *   exists yet, so no field hints are emitted. This produces a faithful,
 *   self-describing key/value block table that a developer can wire to a model later.
 * Generated: 2026-09-21
 *
 * Source DOM (validated against migration-work/block-context/defaultoffer/source.html):
 *   .defaultoffer.block > div
 *     .offerblock-image           -> img + div>p (caption)
 *     .offerblock-content
 *       .offerblock-content--title    > p
 *       .offerblock-content--spacer   (ignored — layout only)
 *       .offerblock-content--subtitle > p
 *       .offerblock-content--date     > p (may be empty)
 *       .offerblock-content--location > p (may be empty)
 *       .offerblock-content--cta      > a.offerblock-content--cta-btn
 *
 * Output: 2-column label/value table (every row has exactly 2 cells).
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION — selectors validated against source.html
  const image = element.querySelector('.offerblock-image img, img');
  const caption = element.querySelector('.offerblock-image div p, .offerblock-image figcaption');
  const title = element.querySelector('.offerblock-content--title p, .offerblock-content--title');
  const subtitle = element.querySelector('.offerblock-content--subtitle p, .offerblock-content--subtitle');
  const date = element.querySelector('.offerblock-content--date p, .offerblock-content--date');
  const location = element.querySelector('.offerblock-content--location p, .offerblock-content--location');
  const cta = element.querySelector('.offerblock-content--cta a, a.offerblock-content--cta-btn');

  // Helper: does an element carry any meaningful (non-whitespace) content?
  const hasText = (el) => el && el.textContent && el.textContent.trim().length > 0;

  // Empty-block guard: nothing meaningful to import.
  if (!image && !hasText(title) && !hasText(subtitle) && !cta) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // OUTPUT — 2-column label/value rows. Each row is [labelCell, valueCell].
  const cells = [];
  const addRow = (label, valueEl) => {
    cells.push([label, valueEl]);
  };

  if (image) addRow('Image', image);
  if (hasText(caption)) addRow('Caption', caption);
  if (hasText(title)) addRow('Title', title);
  if (hasText(subtitle)) addRow('Subtitle', subtitle);
  // Date/Location containers exist in the design even when empty in this
  // instance; only emit them when they actually carry content.
  if (hasText(date)) addRow('Date', date);
  if (hasText(location)) addRow('Location', location);
  if (cta) addRow('CTA', cta);

  const block = WebImporter.Blocks.createBlock(document, { name: 'defaultoffer', cells });
  element.replaceWith(block);
}
