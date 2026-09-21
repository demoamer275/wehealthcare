export default function decorate(block) {
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'safetyindication-inner';

  const header = document.createElement('div');
  header.className = 'safetyindication-header';

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'safetyindication-toggle';
  toggleButton.setAttribute('aria-expanded', 'false');
  toggleButton.setAttribute('aria-label', 'Expand safety information');

  const toggleLabel = document.createElement('span');
  toggleLabel.className = 'safetyindication-toggle-label';
  toggleLabel.textContent = 'More safety information';

  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'safetyindication-toggle-icon';
  toggleIcon.textContent = '▲';

  toggleButton.append(toggleLabel, toggleIcon);
  header.append(toggleButton);

  const content = document.createElement('div');
  content.className = 'safetyindication-content';

  while (block.firstChild) {
    content.append(block.firstChild);
  }

  contentWrapper.append(header, content);
  block.append(contentWrapper);

  const toggleExpanded = () => {
    const isExpanded = block.classList.toggle('expanded');
    toggleButton.setAttribute('aria-expanded', String(isExpanded));
    toggleButton.setAttribute(
      'aria-label',
      isExpanded ? 'Collapse safety information' : 'Expand safety information',
    );
  };

  toggleButton.addEventListener('click', toggleExpanded);
}

