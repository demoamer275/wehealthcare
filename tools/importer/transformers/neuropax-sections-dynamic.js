/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: neuropax sub-site DYNAMIC section breaks + section metadata.
 *
 * The neuropax sub-site pages differ structurally per template and carry richer,
 * sub-site-specific section metadata than the main site. This walks the live
 * `main > div.section` elements at runtime and reconstructs, per section:
 *   - a <hr> break before it (except the first section)
 *   - a Section Metadata block rebuilt from the data attributes EDS applied
 *     while decorating the source's authored section-metadata:
 *       data-sec-spacing        -> "sec-spacing"
 *       data-sec-spacing-bottom -> "sec-spacing-bottom"
 *       data-sec-swoosh         -> "sec-swoosh"
 *       data-sec-layout         -> "sec-layout"
 *       class bg-default/bg-light/default -> "style"
 *
 * Runs in afterTransform: block parsers replace inner `.block` elements, but the
 * `main > div.section` containers survive, so anchoring after parsing is safe.
 * The data-microsite="neuropax" marker is intentionally NOT carried into content
 * (it is applied by the runtime microsite plugin, not an authored value).
 */

// Custom-key data attributes → Section Metadata row keys, with their "no-op" defaults.
const KEY_MAP = [
  { attr: 'data-sec-spacing', key: 'sec-spacing', skip: 'section-none' },
  { attr: 'data-sec-spacing-bottom', key: 'sec-spacing-bottom', skip: 'section-none' },
  { attr: 'data-sec-swoosh', key: 'sec-swoosh', skip: 'sec-swoosh-none' },
  { attr: 'data-sec-layout', key: 'sec-layout', skip: null },
];

function styleFromClass(el) {
  if (el.classList.contains('bg-light')) return 'bg-light';
  if (el.classList.contains('bg-default')) return 'bg-default';
  if (el.classList.contains('default')) return 'default';
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;

  const main = element.querySelector('main') || element;
  const sections = [...main.children].filter(
    (c) => c.tagName === 'DIV' && c.classList.contains('section'),
  );
  if (sections.length === 0) return;

  sections.forEach((section, i) => {
    // 1. Section break before every section except the first.
    if (i > 0) {
      const hr = document.createElement('hr');
      section.before(hr);
    }

    // 2. Rebuild the Section Metadata block from data attributes / classes.
    const cells = {};

    const style = styleFromClass(section);
    if (style) cells.style = style;

    KEY_MAP.forEach(({ attr, key, skip }) => {
      const val = section.getAttribute(attr);
      if (val && (skip === null || val !== skip)) cells[key] = val;
    });

    if (Object.keys(cells).length === 0) return;

    const metadataBlock = WebImporter.Blocks.createBlock(document, {
      name: 'Section Metadata',
      cells,
    });
    section.append(metadataBlock);
  });
}
