/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wehealthcare DYNAMIC section breaks + section metadata.
 *
 * Used by the multi-page "health-wellness" template (health-wellness,
 * insurance-plans, member-resources) whose pages differ structurally
 * (5 / 4 / 4 sections). Rather than a fixed section list, this walks the live
 * `main > div.section` elements at runtime and reconstructs, per section:
 *   - a <hr> break before it (except the first section)
 *   - a Section Metadata block rebuilt from the data attributes EDS applied
 *     while decorating the source's authored section-metadata:
 *       data-sec-spacing        -> "sec-spacing"
 *       data-sec-spacing-bottom -> "sec-spacing-bottom"
 *       data-sec-full-width     -> "sec-full-width"
 *       class bg-default/bg-light -> "style"
 *
 * Runs entirely in afterTransform: block parsers replace the inner `.block`
 * elements, but the `main > div.section` containers survive, so anchoring to
 * them after parsing is safe.
 */

const DEFAULTS = {
  'sec-spacing': 'section-none',
  'sec-spacing-bottom': 'section-none',
  'sec-full-width': 'false',
};

function styleFromClass(el) {
  if (el.classList.contains('bg-light')) return 'bg-light';
  if (el.classList.contains('bg-default')) return 'bg-default';
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;

  // Only the top-level content sections, not nav/footer chrome (already removed
  // by the cleanup transformer) or nested wrappers.
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

    const spacing = section.getAttribute('data-sec-spacing');
    if (spacing && spacing !== DEFAULTS['sec-spacing']) cells['sec-spacing'] = spacing;

    const spacingBottom = section.getAttribute('data-sec-spacing-bottom');
    if (spacingBottom && spacingBottom !== DEFAULTS['sec-spacing-bottom']) {
      cells['sec-spacing-bottom'] = spacingBottom;
    }

    const fullWidth = section.getAttribute('data-sec-full-width');
    if (fullWidth && fullWidth !== DEFAULTS['sec-full-width']) cells['sec-full-width'] = fullWidth;

    // Only emit a Section Metadata block when there is something meaningful to carry.
    if (Object.keys(cells).length === 0) return;

    const metadataBlock = WebImporter.Blocks.createBlock(document, {
      name: 'Section Metadata',
      cells,
    });
    section.append(metadataBlock);
  });
}
