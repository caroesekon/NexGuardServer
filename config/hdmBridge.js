const axios = require('axios');

const getConfig = async () => {
  const Setting = require('../models/admin/Setting');
  const settings = await Setting.findOne();
  const email = settings?.email || {};

  return {
    baseURL: email.baseUrl || 'https://hdmbridgeserver.pxxl.click/api',
    apiKey: email.apiKey || '',
    fromEmail: email.senderEmail || 'noreply@nexguard.io',
    fromName: email.senderName || 'NexGuard',
  };
};

const sendEmail = async ({ to, subject, htmlBody, textBody }) => {
  const config = await getConfig();

  const response = await axios.post(`${config.baseURL}/emails/send`, {
    from: config.fromEmail,
    fromName: config.fromName,
    to,
    subject,
    htmlBody,
    textBody,
  }, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  return response.data;
};

module.exports = { sendEmail, getConfig };