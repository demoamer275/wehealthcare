export default function decorate(block) {
  // Wrapper div with display:none
  const wrapper = document.createElement('div');
  wrapper.style.display = 'none';

  // Image section
  const imageSection = document.createElement('div');
  imageSection.classList.add('offerblock-image');

  const img = document.createElement('img');
  img.src = 'speakers.jpg';

  const bylineWrapper = document.createElement('div');
  const bylineParagraph = document.createElement('p');
  bylineParagraph.textContent = 'byline';
  bylineWrapper.append(bylineParagraph);

  imageSection.append(img, bylineWrapper);

  // Content section
  const contentSection = document.createElement('div');
  contentSection.classList.add('offerblock-content');

  const titleDiv = document.createElement('div');
  titleDiv.classList.add('offerblock-content--title');
  const titleP = document.createElement('p');
  titleP.textContent = 'NeuroPax Clinical Perspectives Seies';
  titleDiv.append(titleP);

  const spacerDiv = document.createElement('div');
  spacerDiv.classList.add('offerblock-content--spacer');

  const subtitleDiv = document.createElement('div');
  subtitleDiv.classList.add('offerblock-content--subtitle');
  const subtitleP = document.createElement('p');
  subtitleP.textContent = 'Advancing Evidence-Based Care Through Data, Dialog and Clinical Experience';
  subtitleDiv.append(subtitleP);

  const dateDiv = document.createElement('div');
  dateDiv.classList.add('offerblock-content--date');
  const dateP = document.createElement('p');
  dateP.textContent = 'April - September 2026';
  dateDiv.append(dateP);

  const locationDiv = document.createElement('div');
  locationDiv.classList.add('offerblock-content--location');
  const locationP = document.createElement('p');
  locationP.textContent = 'New ork | Chicago | Atlanta | Las Vegas';
  locationDiv.append(locationP);

  const ctaDiv = document.createElement('div');
  ctaDiv.classList.add('offerblock-content--cta');
  const ctaLink = document.createElement('a');
  ctaLink.classList.add('offerblock-content--cta-btn');
  ctaLink.href = '#';
  ctaLink.textContent = 'Register Now';
  ctaDiv.append(ctaLink);

  contentSection.append(
    titleDiv,
    spacerDiv,
    subtitleDiv,
    dateDiv,
    locationDiv,
    ctaDiv,
  );

  // Assemble wrapper
  wrapper.append(imageSection, contentSection);

  // Replace original block content
  block.innerHTML = '';
  block.append(wrapper);
}
