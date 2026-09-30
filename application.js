const jobCatalog = {
  'remote-customer-representative': {
    department: 'Customer Operations', title: 'Remote Customer Representative', pay: '$26.00 - $32.00 / hour ($54k - $66k/yr)', range: '$26.00–$32.00'
  },
  'remote-financial-assistance-coordinator': {
    department: 'Financial & Billing', title: 'Remote Financial Assistance Coordinator', pay: '$30.00 - $37.00 / hour ($62k - $77k/yr)', range: '$30.00–$37.00'
  },
  'benefit-coordinator': {
    department: 'Insurance & Benefits', title: 'Benefit Coordinator', pay: '$26.00 - $32.00 / hour ($54k - $66k/yr)', range: '$26.00–$32.00'
  },
  'remote-care-coordinator': {
    department: 'Clinical Support', title: 'Remote Care Coordinator', pay: '$26.00 - $32.00 / hour ($54k - $66k/yr)', range: '$26.00–$32.00'
  },
  'remote-billing-claims-specialist': {
    department: 'Financial & Billing', title: 'Remote Billing & Claims Specialist', pay: '$26.00 - $32.00 / hour ($54k - $66k/yr)', range: '$26.00–$32.00'
  }
};

const params = new URLSearchParams(window.location.search);
const job = jobCatalog[params.get('job')] || jobCatalog['remote-care-coordinator'];
const form = document.querySelector('#application-form');
const steps = [...document.querySelectorAll('.form-step')];
const progressItems = [...document.querySelectorAll('.progress-list li')];
const defaultApiBaseUrl = 'https://charlie-health-backend-production.up.railway.app';
const apiBaseUrl = (window.CH_APP_API_BASE_URL || defaultApiBaseUrl).replace(/\/$/, '');
let currentStep = 1;

const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const setJobDetails = () => {
  document.querySelector('#job-department').textContent = job.department;
  document.querySelector('#job-title').textContent = job.title;
  document.querySelector('#job-meta').textContent = `Remote US · ${job.pay}`;
  document.querySelector('#position-field').value = job.title;
  document.querySelector('#salary-note').textContent = `The posted pay range for this position is ${job.range} per hour.`;
  document.querySelector('#submitted-role').textContent = job.title;
};

const validateStep = () => {
  const activeStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  let isValid = true;
  activeStep.querySelectorAll('[required]').forEach((field) => {
    const group = field.type === 'radio' ? activeStep.querySelectorAll(`[name="${field.name}"]`) : [field];
    const hasValue = field.type === 'radio'
      ? [...group].some((radio) => radio.checked)
      : field.type === 'checkbox' ? field.checked : field.value.trim() !== '';
    field.closest('label, fieldset')?.classList.toggle('invalid', !hasValue);
    if (!hasValue) isValid = false;
  });
  return isValid;
};

const updateProgress = () => {
  steps.forEach((step) => step.classList.toggle('active', Number(step.dataset.step) === currentStep));
  progressItems.forEach((item, index) => {
    item.classList.toggle('active', index + 1 === currentStep);
    item.classList.toggle('complete', index + 1 < currentStep);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const readValue = (name, fallback = '—') => {
  const field = form.elements[name];
  if (!field) return fallback;
  if (field.type === 'radio') return form.querySelector(`input[name="${name}"]:checked`)?.value || fallback;
  if (field.type === 'file') return field.files[0]?.name || fallback;
  return field.value || fallback;
};

const buildSummary = () => {
  const sections = [
    { title: 'Personal information', editStep: 1, rows: [['Full name', `${readValue('firstName')} ${readValue('lastName')}`], ['Email', readValue('email')], ['Phone', readValue('phone')], ['City', readValue('city')], ['State', readValue('state')]] },
    { title: 'Role preferences', editStep: 2, rows: [['Position', job.title], ['Work location', readValue('location')], ['Employment type', readValue('employmentType')], ['Start availability', readValue('startDate')], ['Work authorization', readValue('workAuthorization')], ['Preferred schedule', readValue('schedule')], ['Salary expectations', readValue('hourlyRate')]] },
    { title: 'Experience', editStep: 3, rows: [['Relevant experience', readValue('relevantExperience')], ['Previous employer', readValue('previousEmployer')], ['Previous role', readValue('previousRole')], ['Employer address', readValue('employerAddress')], ['Employer phone', readValue('employerPhone')], ['Employer email', readValue('employerEmail')], ['Years of experience', readValue('yearsExperience')], ['Remote experience', readValue('remoteExperience')], ['Education', readValue('education')], ['Resume filename', readValue('resume')]] },
    { title: 'Interview', editStep: 4, rows: [['Preferred date', formatDate(readValue('interviewDate', ''))], ['Preferred time', readValue('interviewTime')], ['Time zone', readValue('timeZone')]] }
  ];
  document.querySelector('#summary-grid').innerHTML = sections.map((section) => `<div class="summary-section"><div class="summary-heading"><h3>${section.title}</h3><button type="button" class="edit-summary" data-edit-step="${section.editStep}">Edit</button></div>${section.rows.map(([label, value]) => `<div class="summary-row"><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>`).join('');
  document.querySelectorAll('.edit-summary').forEach((button) => button.addEventListener('click', () => { currentStep = Number(button.dataset.editStep); updateProgress(); }));
};

document.querySelectorAll('.next-step').forEach((button) => button.addEventListener('click', () => {
  if (!validateStep()) return;
  if (currentStep === 4) buildSummary();
  currentStep = Math.min(currentStep + 1, 5);
  updateProgress();
}));

document.querySelectorAll('.previous-step').forEach((button) => button.addEventListener('click', () => {
  currentStep = Math.max(currentStep - 1, 1);
  updateProgress();
}));

form.querySelectorAll('textarea').forEach((textarea) => {
  textarea.addEventListener('input', () => {
    const counter = document.querySelector(`[data-count-for="${textarea.name}"]`);
    if (counter) counter.textContent = textarea.value.length;
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!validateStep()) return;
  const id = `CH-${Date.now().toString().slice(-8)}`;
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  formData.append('applicationId', id);
  formData.append('jobId', params.get('job') || 'remote-care-coordinator');
  formData.append('jobDepartment', job.department);
  formData.append('jobTitle', job.title);
  formData.append('jobPay', job.pay);
  submitButton.disabled = true;
  submitButton.querySelector('span').textContent = '...';

  try {
    const requestUrl = apiBaseUrl ? `${apiBaseUrl}/api/applications` : '/api/applications';
    const response = await fetch(requestUrl, { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Application submission failed');
    window.location.href = `application-submitted.html?job=${encodeURIComponent(params.get('job') || 'remote-care-coordinator')}&id=${encodeURIComponent(id)}`;
  } catch (error) {
    submitButton.disabled = false;
    submitButton.querySelector('span').textContent = '→';
    const message = apiBaseUrl
      ? 'We could not submit your application. Please try again.'
      : 'The application backend is not available on this static deployment. Deploy the Express app to a Node host and set CH_APP_API_BASE_URL to the live API URL.';
    window.alert(message);
  }
});

setJobDetails();
