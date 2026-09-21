const STATES = [
  'Alabama|AL',
  'Alaska|AK',
  'Arizona|AZ',
  'Arkansas|AR',
  'California|CA',
  'Colorado|CO',
  'Connecticut|CT',
  'Delaware|DE',
  'District of Columbia|DC',
  'Florida|FL',
  'Georgia|GA',
  'Hawaii|HI',
  'Idaho|ID',
  'Illinois|IL',
  'Indiana|IN',
  'Iowa|IA',
  'Kansas|KS',
  'Kentucky|KY',
  'Louisiana|LA',
  'Maine|ME',
  'Maryland|MD',
  'Massachusetts|MA',
  'Michigan|MI',
  'Minnesota|MN',
  'Mississippi|MS',
  'Missouri|MO',
  'Montana|MT',
  'Nebraska|NE',
  'Nevada|NV',
  'New Hampshire|NH',
  'New Jersey|NJ',
  'New Mexico|NM',
  'New York|NY',
  'North Carolina|NC',
  'North Dakota|ND',
  'Ohio|OH',
  'Oklahoma|OK',
  'Oregon|OR',
  'Pennsylvania|PA',
  'Rhode Island|RI',
  'South Carolina|SC',
  'South Dakota|SD',
  'Tennessee|TN',
  'Texas|TX',
  'Utah|UT',
  'Vermont|VT',
  'Virginia|VA',
  'Washington|WA',
  'West Virginia|WV',
  'Wisconsin|WI',
  'Wyoming|WY',
];

function createFieldWrapper(labelText, inputElement, required = false, className = '') {
  const wrapper = document.createElement('div');
  wrapper.classList.add('regform-field', className);

  const label = document.createElement('label');
  label.textContent = labelText;
  if (required) {
    const requiredSpan = document.createElement('span');
    requiredSpan.classList.add('regform-required');
    requiredSpan.textContent = ' *';
    label.append(requiredSpan);
  }

  if (inputElement.id) {
    label.htmlFor = inputElement.id;
  }

  wrapper.append(label, inputElement);
  return wrapper;
}

function createSelect(name, id) {
  const select = document.createElement('select');
  select.name = name;
  select.id = id;
  return select;
}

function createInput(type, name, id, placeholder = '') {
  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  input.id = id;
  if (placeholder) {
    input.placeholder = placeholder;
  }
  return input;
}

function addOptionsToSelect(select, options) {
  //const options = optionString.split(',');
  options.forEach((option) => {
    const optionElement = document.createElement('option');
    const idx = option.indexOf("|");
    const text = option.substring(0,idx);
    const value = option.substring(idx+1);
    optionElement.value = value; //option?.trim();
    optionElement.textContent = text; //option?.trim();
    select.append(optionElement);
  });
}

export default function decorate(block) {
  const specialties = block.querySelector(':scope div:nth-child(2) > div')?.textContent?.trim() || 'none';;
  const eventNames = block.querySelector(':scope div:nth-child(1) > div')?.textContent?.trim() || 'none';;
  const redirectUrl = block.querySelector(':scope div:nth-child(3) > div')?.textContent?.trim() || 'none';;
console.log("redirectUrl: " + redirectUrl);

  const form = document.createElement('form');
  form.classList.add('regform-form');
  form.method = 'post';
  form.action = 'https://440115-191salmonscallop.adobeioruntime.net/api/v1/web/formstorm/wehc'; //'https://hook.app.workfrontfusion.com/yd8it6ivn9muqn8x4f4v9jdx1sfef2ew'; //

  // Event Name (select, required)
  const eventSelect = createSelect('eventName', 'regform-event-name');
  const eventPlaceholder = document.createElement('option');
  eventPlaceholder.value = '';
  eventPlaceholder.textContent = 'Select Event';
  eventPlaceholder.disabled = true;
  eventPlaceholder.selected = true;
  eventSelect.append(eventPlaceholder);
  if (eventNames !== "none") addOptionsToSelect(eventSelect, eventNames.split(","));
  eventSelect.required = true;
 // eventSelect.classList.add('single-col');
  form.append(createFieldWrapper('Event Name', eventSelect, true, 'single-col'));

  // First Name (text, required)
  const firstNameInput = createInput('text', 'firstName', 'regform-first-name', 'First Name');
  firstNameInput.required = true;
 // firstNameInput.classList.add('double-col');
  form.append(createFieldWrapper('First Name', firstNameInput, true, 'double-col'));

  // Last Name (text, required)
  const lastNameInput = createInput('text', 'lastName', 'regform-last-name', 'Last Name');
  lastNameInput.required = true;
 // lastNameInput.classList.add('double-col');
  form.append(createFieldWrapper('Last Name', lastNameInput, true, 'double-col'));

  // State (select, required)
  const stateSelect = createSelect('state', 'regform-state');
  const statePlaceholder = document.createElement('option');
  statePlaceholder.value = '';
  statePlaceholder.textContent = 'Select State';
  statePlaceholder.disabled = true;
  statePlaceholder.selected = true;
  stateSelect.append(statePlaceholder);
  //STATES.forEach((state) => {
  //  const option = document.createElement('option');
  //  option.value = state;
  //  option.textContent = state;
  //  stateSelect.append(option);
  //});
  addOptionsToSelect(stateSelect,STATES)
  stateSelect.required = true;
  form.append(createFieldWrapper('State', stateSelect, true, 'triple-col'));

  // Phone (tel)
  const phoneInput = createInput('tel', 'phone', 'regform-phone', 'Phone');
  form.append(createFieldWrapper('Phone', phoneInput, false, 'triple-col'));

  // Email (email, required)
  const emailInput = createInput('email', 'email', 'regform-email', 'Email');
  emailInput.required = true;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf("hcdemologin") === 0) {
      const loginname = decodeURIComponent(c.substring("hcdemologin=".length, c.length));
      emailInput.value = loginname;
    }
  }
  form.append(createFieldWrapper('Email', emailInput, true, 'triple-col'));

  // Specialty (select with Oncology / Neurology, required)
  const specialtySelect = createSelect('specialty', 'regform-specialty');
  const specialtyPlaceholder = document.createElement('option');
  specialtyPlaceholder.value = '';
  specialtyPlaceholder.textContent = 'Select Specialty';
  specialtyPlaceholder.disabled = true;
  specialtyPlaceholder.selected = true;
  specialtySelect.append(specialtyPlaceholder);

  if (specialties !== "none") addOptionsToSelect(specialtySelect, specialties.split(","));

  specialtySelect.required = true;
 // specialtySelect.classList.add('single-col');
  form.append(createFieldWrapper('Specialty', specialtySelect, true, 'single-col'));

  // hidden ecid field
  const ecidInput = createInput('hidden', 'ecid', 'regform-ecid', '');
  const ecid = sessionStorage.getItem("com.adobe.reactor.dataElements.ECID");

  console.log("ecid: " + ecid);
  ecidInput.value = ecid;
  form.append(createFieldWrapper('ecid', ecidInput, false, 'hidden-field'));

  // Submit button
  const submitWrapper = document.createElement('div');
  submitWrapper.classList.add('regform-actions');
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.classList.add('regform-submit');
  submitButton.textContent = 'Submit';
  submitWrapper.append(submitButton);
  // submitButton.addEventListener('click', () => {
    // console.log('submitButton clicked');
    // Fake form submission
    // form.submit();
 
    //window.location.href = redirectUrl.replace('/content/wehealthcare/language-masters', '');
  // });

  form.append(submitWrapper);
  form.addEventListener('submit', function(event) {
    
    event.preventDefault();

    const submitUrl = form.action; 
    const encType = 'application/x-www-form-urlencoded';
    const redirectUrl = 'https://main--tvhc--dprevelige.aem.page/en/pharma/neuropax/events/registration-confirmation'; 
    const formData = new FormData(this);
    const urlEncodedData = new URLSearchParams(formData);

    fetch(submitUrl, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlEncodedData,
    })
    .then(response => {
        if (response.ok) {
            window.location.href = redirectUrl;
        } else {
            console.error('Form submission failed with status:', response.status);
        }
    })
    .catch(error => {
        console.error('Network error during form submission:', error);
    });
  });
  // Replace original block content
  block.innerHTML = '';
  block.append(form);
}

