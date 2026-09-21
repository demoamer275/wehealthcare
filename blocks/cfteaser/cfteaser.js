import { getMetadata } from '../../scripts/aem.js';
import { isAuthorEnvironment, moveInstrumentation } from '../../scripts/scripts.js';
import { getHostname, mapAemPathToSitePath } from '../../scripts/utils.js';
import { readBlockConfig } from '../../scripts/aem.js';


/**
 *
 * @param {Element} block
 */
export default async function decorate(block) {
	
  // Configuration
  const UNIQUE_ID = 'dpreveli_adobedemoamericas275my1820831919654__185JadeCrocodile';
  //const WEBHOOK_URL = 'https://hook.app.workfrontfusion.com/6qezw31mfq7r1ytgabcqifhn16v4uyw5';
  const WEBHOOK_URL = 'https://hook.app.workfrontfusion.com/xy2bm8b8x94fjn53iis1sh1im4k79nxj';
  const TEMPLATE_NAME = 'Top Image CTA';
	
  const contentPath = block.querySelector(':scope div:nth-child(1) > div a')?.textContent?.trim();
	const variationname = block.querySelector(':scope div:nth-child(2) > div')?.textContent?.trim()?.toLowerCase()?.replace(' ', '_') || 'master';
	const displayStyle = block.querySelector(':scope div:nth-child(3) > div')?.textContent?.trim() || TEMPLATE_NAME;

  const isAuthor = isAuthorEnvironment();
console.log("in cfteaser js");
  block.innerHTML = '';
  const params = '?uniqueID=' + UNIQUE_ID + '&templateName=' + displayStyle + '&cfPath=' + contentPath + '&variation=' + variationname + '&isAuthor=' + isAuthor;
  const itemId = `urn:aemconnection:${contentPath}/jcr:content/data/${variationname}`;
    try {
        // Fetch data
        const response = await fetch(WEBHOOK_URL + params);

        if (!response.ok) {
					console.error(`error making cf+t render request:${response.status}`, {
	          error: error.message,
	          stack: error.stack,
	          contentPath,
	          variationname,
	          isAuthor
        	});
          block.innerHTML = '<div>Webhook Error</div>';
          return; // Exit early if response is not ok
        } 

        let offer;
        try {
          offer = await response.text();

        } catch (parseError) {
					console.error('Error parsing offer text from response:', {
	          error: error.message,
	          stack: error.stack,
	          contentPath,
	          variationname,
	          isAuthor
        	});
          block.innerHTML = '<div>Parse Error</div>';
          return;
        }
        const parser = new DOMParser();
        const doc = parser.parseFromString(offer, 'text/html');
        const overlay = doc.querySelector('.cfteaser-overlay');
        if (overlay) { 
          overlay.setAttribute('data-aue-type', 'reference');
          overlay.setAttribute('data-aue-label', variationname);
          overlay.setAttribute('data-aue-resource', itemId);
          overlay.setAttribute('data-aue-filter', 'contentfragment');
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
          isAuthor
        });
        block.innerHTML = '<div>Error rendering</div>';
      }

}
