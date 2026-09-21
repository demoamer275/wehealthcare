/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: regform
 * Base block: regform (custom crosswalk static registration form — NOT yet in this repo)
 * Source: https://main--tvhc--dprevelige.aem.page/en/pharma/neuropax/events
 * Project type: xwalk. NOTE: no model file (blocks/regform/_regform.json)
 *   exists yet, so no field hints are emitted. This produces a faithful,
 *   row-per-field representation of the static form.
 * Generated: 2026-09-21
 *
 * Source DOM (validated against migration-work/block-context/regform/source.html):
 *   .regform.block > form.regform-form
 *     .regform-field.{single-col|double-col|triple-col|hidden-field}
 *       label (+ span.regform-required " *")
 *       select > option ...   OR   input
 *     .regform-actions > button.regform-submit
 *
 * Each field becomes one row. Column layout:
 *   col1 = field label
 *   col2 = field type + layout + required flag
 *   col3 = options (selects) or empty (inputs)
 * A trailing Submit row captures the action button.
 *
 * Output: 3-column table (every row padded to exactly 3 cells).
 */
export default function parse(element, { document }) {
  const form = element.querySelector('form.regform-form, form') || element;
  const fields = Array.from(form.querySelectorAll('.regform-field'));

  // Empty-block guard.
  if (fields.length === 0 && !form.querySelector('.regform-submit, button')) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Layout class -> label
  const layoutOf = (fieldEl) => {
    const c = Array.from(fieldEl.classList);
    if (c.includes('single-col')) return 'single-col';
    if (c.includes('double-col')) return 'double-col';
    if (c.includes('triple-col')) return 'triple-col';
    if (c.includes('hidden-field')) return 'hidden-field';
    return '';
  };

  const cells = [];

  fields.forEach((fieldEl) => {
    // Label text (strip the required marker span for a clean label).
    const labelEl = fieldEl.querySelector('label');
    let labelText = '';
    if (labelEl) {
      const clone = labelEl.cloneNode(true);
      clone.querySelectorAll('.regform-required').forEach((s) => s.remove());
      labelText = clone.textContent.trim();
    }

    const select = fieldEl.querySelector('select');
    const input = fieldEl.querySelector('input, textarea');
    const required = !!fieldEl.querySelector('.regform-required');
    const layout = layoutOf(fieldEl);

    // Column 1: label
    const labelCell = document.createElement('p');
    labelCell.textContent = labelText || (select ? select.id : (input ? input.id : 'field'));

    // Column 2: type + layout + required, one line each.
    const type = select ? 'select' : (input ? (input.tagName.toLowerCase()) : 'field');
    const metaCell = [];
    const typeP = document.createElement('p');
    typeP.textContent = `Type: ${type}`;
    metaCell.push(typeP);
    if (layout) {
      const layoutP = document.createElement('p');
      layoutP.textContent = `Layout: ${layout}`;
      metaCell.push(layoutP);
    }
    const reqP = document.createElement('p');
    reqP.textContent = `Required: ${required ? 'yes' : 'no'}`;
    metaCell.push(reqP);

    // Column 3: options for selects (as a list), empty otherwise.
    let optionsCell = '';
    if (select) {
      const opts = Array.from(select.querySelectorAll('option'))
        .map((o) => o.textContent.trim())
        .filter(Boolean);
      if (opts.length > 0) {
        const ul = document.createElement('ul');
        opts.forEach((o) => {
          const li = document.createElement('li');
          li.textContent = o;
          ul.appendChild(li);
        });
        optionsCell = ul;
      }
    }

    cells.push([labelCell, metaCell, optionsCell]); // always 3 cells
  });

  // Submit / actions row.
  const submit = form.querySelector('.regform-submit, .regform-actions button, button[type="submit"], button');
  if (submit) {
    const submitLabel = document.createElement('p');
    submitLabel.textContent = 'Submit';
    const submitMeta = document.createElement('p');
    submitMeta.textContent = (submit.textContent || 'Submit').trim();
    cells.push([submitLabel, submitMeta, '']); // padded to 3 cells
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'regform', cells });
  element.replaceWith(block);
}
