const axios = require('axios');

const getConfig = async () => {
  const Setting = require('../models/admin/Setting');
  const settings = await Setting.findOne();
  const ai = settings?.ai || {};

  let baseURL = ai.baseUrl || 'https://hdmaiserver.pxxl.click';
  baseURL = baseURL.replace(/\/$/, '');
  if (!baseURL.endsWith('/api/v1')) {
    baseURL += '/api/v1';
  }

  return {
    baseURL,
    apiKey: ai.apiKey || '',
    model: ai.model || 'vault',
  };
};

const chat = async ({ message, userId, data = {}, isPublic = false }) => {
  const config = await getConfig();
  const url = `${config.baseURL}/projects/${config.model}/chat`;

  const response = await axios.post(url, {
    message,
    user_id: userId,
    data,
    is_public: isPublic,
  }, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  return response.data;
};

module.exports = { chat, getConfig };