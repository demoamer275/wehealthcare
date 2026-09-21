/**
 * CF Teaser block: renders a Content Fragment through a Workfront Fusion
 * webhook that returns pre-rendered markup for a given template.
 *
 * Authored content (rows):
 *   1. Content Fragment path/link
 *   2. Variation name (optional, defaults to "master")
 *
 * The template is picked via a block variant (extra word in the block name,
 * e.g. "CF Teaser (left-image-cta)") rather than a dedicated row.
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  const UNIQUE_ID = 'dpreveli_adobedemoamericas275my1820831919654__185JadeCrocodile';
  const WEBHOOK_URL = 'https://hook.app.workfrontfusion.com/xy2bm8b8x94fjn53iis1sh1im4k79nxj';
  const TEMPLATE_NAME = 'Top Image CTA';
  const TEMPLATE_VARIANTS = {
    'top-image-cta': 'Top Image CTA',
    'left-image-cta': 'Left Image CTA',
  };

  const contentPath = block.querySelector(':scope div:nth-child(1) > div a')?.textContent?.trim();
  const variationname = block.querySelector(':scope div:nth-child(2) > div')?.textContent?.trim()?.toLowerCase()?.replace(' ', '_') || 'master';
  const variantClass = Object.keys(TEMPLATE_VARIANTS).find((v) => block.classList.contains(v));
  const displayStyle = variantClass ? TEMPLATE_VARIANTS[variantClass] : TEMPLATE_NAME;

  block.innerHTML = '';
  const params = `?uniqueID=${UNIQUE_ID}&templateName=${displayStyle}&cfPath=${contentPath}&variation=${variationname}&isAuthor=false`;

  try {
    const response = await fetch(WEBHOOK_URL + params);

    if (!response.ok) {
      console.error(`error making cf+t render request:${response.status}`, {
        contentPath,
        variationname,
      });
      block.innerHTML = '<div>Webhook Error</div>';
      return; // Exit early if response is not ok
    }

    let offer;
    try {
      offer = await response.text();
    } catch (parseError) {
      console.error('Error parsing offer text from response:', {
        error: parseError.message,
        stack: parseError.stack,
        contentPath,
        variationname,
      });
      block.innerHTML = '<div>Parse Error</div>';
      return;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(offer, 'text/html');
    const overlay = doc.querySelector('.cfteaser-overlay');
    if (overlay) {
      block.innerHTML = overlay.outerHTML;
    } else {
      block.innerHTML = '<div>Empty</div>';
    }
  } catch (error) {
    console.error('Error rendering content fragment:', {
      error: error.message,
      stack: error.stack,
      contentPath,
      variationname,
    });
    block.innerHTML = '<div>Error rendering</div>';
  }
}
