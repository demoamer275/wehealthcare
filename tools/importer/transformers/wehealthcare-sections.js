/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wehealthcare section breaks + section metadata.
 *
 * Home template has 5 sections (page-templates.json). Selectors below come
 * directly from each section's DOM-verified `selector` array:
 *   rc1 hero-full-bleed   (style: none, first section — no break)
 *   rc2 intro-text        (style: none)
 *   rc3 cards-row-1        (style: none)
 *   rc4 cards-row-2        (style: none)
 *   rc5 find-doctor-hero   (style: light — gets Section Metadata)
 *
 * Expected: 4 <hr> breaks, 1 Section Metadata block.
 *
 * Breaks are inserted in beforeTransform (while every section element still
 * exists, before block parsers replace them) using a marker attr; metadata is
 * inserted in afterTransform anchored to the surviving marker/element.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors — try each in order, first match wins.
function querySection(root, selectors) {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // no selector matched — skip, never guess a replacement

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have run and may have replaced section elements. Anchor each styled
    // section's metadata to the surviving marker <hr> or the original element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
