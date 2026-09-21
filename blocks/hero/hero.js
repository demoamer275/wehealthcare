/**
 * Hero block.
 *
 * Underline, layout and background style are controlled via block variants
 * (extra words in the block name, e.g. "Hero (image-left, theme-dark)") that
 * CSS targets directly on the block, so no JS is needed for those.
 *
 * CTA style is also a block variant, but its class has to be moved onto the
 * button container rather than staying on the block itself.
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const CTA_STYLES = ['button', 'button-secondary', 'link'];
  const ctaStyle = CTA_STYLES.find((v) => block.classList.contains(v));

  const buttonContainer = block.querySelector('p.button-container');
  if (buttonContainer && ctaStyle) {
    buttonContainer.classList.add(`cta-${ctaStyle}`);
  }
}
