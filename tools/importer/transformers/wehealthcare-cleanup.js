/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wehealthcare site-wide cleanup.
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content (the hero and cards blocks inside <main>).
 *
 * All selectors verified against migration-work/cleaned.html:
 *  - <header class="header-wrapper"> ... nav, search, login, lang-switcher
 *  - <footer class="footer-wrapper"> ... logo + copyright
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome (verified in cleaned.html).
    WebImporter.DOMUtils.remove(element, [
      'header.header-wrapper',
      'footer.footer-wrapper',
      'header',
      'footer',
    ]);
  }
}
