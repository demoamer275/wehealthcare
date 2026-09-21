/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: find-a-doctor
 * Base block: find-a-doctor (custom block — no Block Collection base)
 * Source: https://main--tvhc--dprevelige.aem.page/en/find-doctor
 * Project type: xwalk
 *
 * Block model: blocks/find-a-doctor/_find-a-doctor.json
 * Template config declares `"key-value": true`, so this is a KEY-VALUE block:
 *   - Column 1 = key (the model field name), Column 2 = value.
 *   - Field hints (<!-- field:x -->) are NOT used for key-value blocks; the
 *     key cell itself identifies the field, so hints would be redundant/wrong.
 *
 * Structure (from source.html): the `.find-doctor.default` root contains one
 * child <div> per key/value pair. Each pair is:
 *   <div><div><p>KEY</p></div><div><p>VALUE</p></div></div>
 * Keys present: subtitle, layout, dataSourceType, contentFragmentFolder,
 * apiUrl, enableProviderNameSearch, enableSubmitAction, submitUrl.
 * Value paragraphs for contentFragmentFolder / apiUrl / submitUrl wrap an <a>
 * anchor which must be preserved intact (href + title).
 *
 * EXCLUDED — the trailing `.find-doctor-header` and `.doctor-results` divs are
 * client-hydrated internals (rendered by the block JS at runtime), not authored
 * content, so they are filtered out of the parsed output.
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION — selectors validated against source.html.
  // Key/value rows are the direct-child <div>s WITHOUT a class. The hydrated
  // internals carry classes (.find-doctor-header, .doctor-results) and are
  // filtered out.
  const rows = Array.from(element.querySelectorAll(':scope > div')).filter(
    (div) => !div.matches('.find-doctor-header, .doctor-results'),
  );

  const cells = [];

  rows.forEach((row) => {
    // Each key/value row has two inner cells: [key, value].
    const inner = row.querySelectorAll(':scope > div');
    if (inner.length < 2) return; // skip anything that isn't a key/value pair

    const keyEl = inner[0];
    const valEl = inner[1];

    // Preserve the value's inner elements (including any <a> anchor) intact.
    // Fall back to text content only if there are no element children.
    const keyContent = keyEl.children.length
      ? Array.from(keyEl.children)
      : keyEl.textContent.trim();
    const valContent = valEl.children.length
      ? Array.from(valEl.children)
      : valEl.textContent.trim();

    // 2-column key/value row.
    cells.push([keyContent, valContent]);
  });

  // Empty-block guard: nothing authored to import.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'find-a-doctor', cells });
  element.replaceWith(block);
}
