/**
 * Text Block block.
 *
 * Authored content (rows):
 *   1. Rich text
 *
 * Alignment and width are controlled via block variants (extra words in the
 * block name, e.g. "Text Block (align-center, width-80)") rather than
 * dedicated rows.
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const textCell = block.querySelector(':scope div:nth-child(1) > div');

  const inner = document.createElement('div');
  inner.classList.add('textblock-inner');

  const content = document.createElement('div');
  content.classList.add('textblock-content');

  if (textCell && textCell.textContent.trim().length > 0) {
    content.innerHTML = textCell.innerHTML;
  } else {
    content.innerHTML = 'PLACEHOLDER';
  }

  inner.append(content);

  // Reset block content to our structured markup
  block.innerHTML = '';
  block.append(inner);

  // Alignment variant (defaults to left)
  //const validAlignments = ['align-left', 'align-center', 'align-right'];
  //const alignment = validAlignments.find((v) => block.classList.contains(v)) || 'align-left';
  //block.classList.add(`textblock-${alignment}`);

  // Width variant
  //const validWidths = ['width-100', 'width-90', 'width-80', 'width-70', 'width-60', 'width-50'];
  //const width = validWidths.find((v) => block.classList.contains(v));
  //if (width) {
  //  block.classList.add(`textblock-${width}`);
  //}
}
