import { createOptimizedPicture } from '../../scripts/aem.js';
import createSlider from '../../scripts/slider.js';
import {
  applyCarouselImageZoom,
  finalizeCarouselImageZoom,
  readCardRowConfig,
} from '../../scripts/card-image-zoom.js';

function setCarouselItems(number) {
  document.querySelector('.carousel > ul')?.style.setProperty('--items-per-view', number);
}

// A row is a carousel card if it has an image OR enough cells to look like a card
// (image, text, style, ctastyle, ...). Robust to model changes that add fields.
function isCardRow(row) {
  if (row.querySelector('picture, img')) return true;
  return row.children.length >= 2;
}

// Carousel-level autoplay/interval/imageZoom are block variants (extra words
// in the block name, e.g. "Carousel (autoplay, interval-7000, zoom-in)")
// rather than dedicated config rows, so they're read off the block's classList.
const INTERVAL_VARIANTS = [3000, 5000, 7000, 10000];
const ZOOM_VARIANTS = ['zoom-in', 'zoom-out', 'big-zoom'];

function extractCarouselConfig(block) {
  const intervalClass = INTERVAL_VARIANTS.find((ms) => block.classList.contains(`interval-${ms}`));
  return {
    autoplay: block.classList.contains('autoplay'),
    intervalMs: intervalClass || 5000,
    imageZoom: ZOOM_VARIANTS.find((v) => block.classList.contains(v)) || '',
  };
}

export default function decorate(block) {
  setCarouselItems(2);

  const carouselConfig = extractCarouselConfig(block);
  block.dataset.autoplay = carouselConfig.autoplay ? 'true' : 'false';
  block.dataset.autoplayInterval = String(carouselConfig.intervalMs);
  if (carouselConfig.imageZoom) {
    block.dataset.imageZoom = carouselConfig.imageZoom;
  }

  const slider = document.createElement('ul');
  const leftContent = document.createElement('div');
  leftContent.className = 'default-content-wrapper';
  let hasLeftContent = false;

  [...block.children].forEach((row) => {
    if (isCardRow(row)) {
      const li = document.createElement('li');

      const config = readCardRowConfig(row);

      if (config.style && config.style !== 'default') {
        li.className = config.style;
      }

      while (row.firstElementChild) li.append(row.firstElementChild);

      [...li.children].forEach((div, index) => {
        if (index === 0) {
          div.className = 'cards-card-image';
        } else if (index === 1) {
          div.className = 'cards-card-body';
        } else {
          div.className = 'cards-config';
          const p = div.querySelector('p');
          if (p) p.style.display = 'none';
        }
      });

      const buttonContainers = li.querySelectorAll('p.button-container');
      buttonContainers.forEach((bc) => {
        bc.classList.remove('default', 'cta-button', 'cta-button-secondary', 'cta-button-dark', 'cta-default');
        bc.classList.add(config.ctaStyle);
      });

      slider.append(li);
    } else {
      hasLeftContent = true;
      while (row.firstElementChild) {
        leftContent.append(row.firstElementChild);
      }
    }
  });

  slider.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  const base = parseInt(block?.dataset?.headingLevel, 10);
  const ariaLevel = Number.isFinite(base) ? Math.min(Math.max(base, 1) + 1, 6) : 3;
  slider.querySelectorAll('h4,h5,h6').forEach((node) => {
    node.setAttribute('role', 'heading');
    node.setAttribute('aria-level', String(ariaLevel));
  });

  block.textContent = '';
  if (hasLeftContent && block.parentNode?.parentNode) {
    block.parentNode.parentNode.prepend(leftContent);
  }
  block.append(slider);

  applyCarouselImageZoom(block, carouselConfig.imageZoom);

  createSlider(block);
  finalizeCarouselImageZoom(block);
}
