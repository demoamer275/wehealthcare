export default function decorate(block) {
  const textCell = block.querySelector(':scope div:nth-child(1) > div');
  const alignmentRaw = block.querySelector(':scope div:nth-child(2) > div')?.textContent?.trim().toLowerCase() || 'left';
  const widthRaw = block.querySelector(':scope div:nth-child(3) > div')?.textContent?.trim() || '100%';

  const inner = document.createElement('div');
  inner.classList.add('textblock-inner');

  const content = document.createElement('div');
  content.classList.add('textblock-content');

  //why not updating
  if (textCell && textCell.textContent.trim().length > 0) {
    content.innerHTML = textCell.innerHTML;
  } else {
    content.innerHTML = "PLACEHOLDER";
  }

  inner.append(content);

  // Reset block content to our structured markup
  block.innerHTML = '';
  block.append(inner);

  // Alignment handling
  const validAlignments = ['left', 'center', 'right'];
  const alignment = validAlignments.includes(alignmentRaw) ? alignmentRaw : 'left';
  block.classList.add(`textblock-align-${alignment}`);

  // Width handling
  let widthValue = widthRaw;
  if (!widthValue.endsWith('%')) {
    widthValue = `${widthValue}%`;
  }
  const widthNumeric = widthValue.replace('%', '');
  const validWidths = ['100', '90', '80', '70', '60', '50'];

  if (validWidths.includes(widthNumeric)) {
    block.classList.add(`textblock-width-${widthNumeric}`);
  }
}

