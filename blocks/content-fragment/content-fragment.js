import { getMetadata } from '../../scripts/aem.js';
import { getHostname, mapAemPathToSitePath } from '../../scripts/utils.js';

/**
 * Content Fragment teaser block.
 *
 * Authored content (rows):
 *   1. Content Fragment path/link
 *   2. Variation name (optional, defaults to "master")
 *
 * Style/layout is controlled via block variants (extra words in the block
 * name, e.g. "Content Fragment (image-left, text-center, cta-button)")
 * rather than dedicated rows, so the values are read directly off the
 * block's classList.
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  const CONFIG = {
    WRAPPER_SERVICE_URL: 'https://3635370-refdemoapigateway-stage.adobeioruntime.net/api/v1/web/ref-demo-api-gateway/fetch-cf',
    GRAPHQL_QUERY: '/graphql/execute.json/wehealthcare/getteaser',
  };
  

  const aempublishurl = window.placeholders?.default?.aempublish; //listOfAllPlaceholdersData?.aempublish;
  const contentPath = block.querySelector(':scope div:nth-child(1) > div p')?.textContent?.trim();
  const variationname = block.querySelector(':scope div:nth-child(2) > div')?.textContent?.trim()?.toLowerCase()?.replace(' ', '_') || 'master';

  const displayStyle = ['image-left', 'image-right', 'image-top', 'image-bottom'].find((v) => block.classList.contains(v)) || '';
  const alignment = ['text-left', 'text-right', 'text-center'].find((v) => block.classList.contains(v)) || '';
  const ctaStyle = ['cta-link', 'cta-button', 'cta-button-secondary', 'cta-button-dark'].find((v) => block.classList.contains(v)) || 'cta-button';

  block.innerHTML = '';

  const requestConfig = {
    url: CONFIG.WRAPPER_SERVICE_URL,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      graphQLPath: `${aempublishurl}${CONFIG.GRAPHQL_QUERY}`,
      cfPath: contentPath,
      variation: `${variationname};ts=${Date.now()}`,
    }),
  };

  try {
    const response = await fetch(requestConfig.url, {
      method: requestConfig.method,
      headers: requestConfig.headers,
      body: requestConfig.body,
    });

    if (!response.ok) {
      console.error(`error making cf graphql request:${response.status}`, {
        contentPath,
        variationname,
      });
      block.innerHTML = '';
      return; // Exit early if response is not ok
    }

    let offer;
    try {
      offer = await response.json();
    } catch (parseError) {
      console.error('Error parsing offer JSON from response:', {
        error: parseError.message,
        stack: parseError.stack,
        contentPath,
        variationname,
      });
      block.innerHTML = '';
      return;
    }

    const cfReq = offer?.data?.teaserByPath?.item;

    if (!cfReq) {
      console.error('Error parsing response from GraphQL request - no valid data found', {
        response: offer,
        contentPath,
        variationname,
      });
      block.innerHTML = '';
      return; // Exit early if no valid data
    }

    const imgUrl = cfReq.image?._publishUrl;

    // Set background image and styles based on layout
    let bannerContentStyle = '';
    let bannerDetailStyle = '';

    if (displayStyle === 'image-left' || displayStyle === 'image-right'
      || displayStyle === 'image-top' || displayStyle === 'image-bottom') {
      bannerContentStyle = `background-image: url(${imgUrl});`;
    } else {
      // Default layout: image as background with gradient overlay
      bannerDetailStyle = `background-image: linear-gradient(90deg,rgba(0,0,0,0.6), rgba(0,0,0,0.1) 80%) ,url(${imgUrl});`;
    }

    // Derive CTA href, mapping AEM repository paths to site-relative paths
    let ctaHref = '#';
    const cta = cfReq?.buttonLink;
    if (cta) {
      if (typeof cta === 'string') {
        ctaHref = /^https?:\/\//i.test(cta) ? cta : `${aempublishurl || ''}${cta}`;
      } else if (typeof cta === 'object') {
        ctaHref = cta._publishUrl || cta._url || cta._path || '#';
      }
    }

    try {
      let candidate = ctaHref;
      if (/^https?:\/\//i.test(candidate)) {
        const u = new URL(candidate);
        candidate = u.pathname;
      }
      if (candidate && candidate.startsWith('/content/')) {
        const mapped = await mapAemPathToSitePath(candidate);
        if (mapped) ctaHref = mapped;
      }
    } catch (e) {
      console.warn('Failed to map CTA via paths.json', e);
    }

    block.innerHTML = `<div class='banner-content block ${displayStyle}' style="${bannerContentStyle}">
        <div class='banner-detail ${alignment}' style="${bannerDetailStyle}">
              <p class='cfeyebrow'>${cfReq?.eyebrow || ''}</p>
              <h2 class='cftitle'>${cfReq?.title}</h2>
              <h3 class='cfsubtitle'>${cfReq?.subTitle || ''}</h3>
              <div class='cfdescription'>${cfReq?.text?.html || ''}</div>
               <p class="button-container ${ctaStyle}">
                <a href="${ctaHref}" target="_blank" rel="noopener" class='button'>
                  <span>${cfReq?.buttonLabel}</span>
                </a>
              </p>
          </div>
          <div class='banner-logo'>
          </div>
      </div>`;
  } catch (error) {
    console.error('Error rendering content fragment:', {
      error: error.message,
      stack: error.stack,
      contentPath,
      variationname,
    });
    block.innerHTML = '';
  }
}
