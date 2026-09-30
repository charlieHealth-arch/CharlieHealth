const submittedTitles = {
  'remote-customer-representative': 'Remote Customer Representative',
  'remote-financial-assistance-coordinator': 'Remote Financial Assistance Coordinator',
  'benefit-coordinator': 'Benefit Coordinator',
  'remote-care-coordinator': 'Remote Care Coordinator',
  'remote-billing-claims-specialist': 'Remote Billing & Claims Specialist'
};

const params = new URLSearchParams(window.location.search);
const jobKey = params.get('job') || 'remote-care-coordinator';
document.querySelector('#submitted-role').textContent = submittedTitles[jobKey] || submittedTitles['remote-care-coordinator'];
document.querySelector('#application-id').textContent = params.get('id') || 'CH-PENDING';
