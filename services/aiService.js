const { chat } = require('../config/hdmAi');
const Setting = require('../models/admin/Setting');

const getConfig = async () => {
  const settings = await Setting.findOne();
  const ai = settings?.ai || {};

  return {
    masterToggle: ai.masterToggle ?? false,
    apiKey: ai.apiKey || '',
    model: ai.model || 'vault',
    color: ai.color || '#00c48c',
    name: ai.name || 'NexGuard AI',
    defaultGreeting: ai.defaultGreeting || 'Hello! I am NexGuard AI. How can I help you secure your system today?',
    toggles: {
      landingPage: ai.toggles?.landingPage ?? false,
      clientDashboard: ai.toggles?.clientDashboard ?? false,
      fileUploadAnalysis: ai.toggles?.fileUploadAnalysis ?? false,
    },
  };
};

// ── Public Chat (Landing Page - No Auth) ─────────────
const publicChat = async (message, extraData = {}) => {
  const config = await getConfig();

  if (!config.masterToggle || !config.toggles.landingPage) {
    return { reply: 'AI assistant is currently unavailable.', enabled: false };
  }

  if (!config.apiKey) {
    return { reply: 'AI assistant is not configured.', enabled: false };
  }

  const result = await chat({
    message,
    userId: 'public',
    isPublic: true,
    data: {
      features: ['Real-Time Protection', 'VPN', 'Firewall', 'Deep Scanning', 'Vault'],
      pricing: 'Free Trial — 30 days, Pro — $9.99/mo, Enterprise — $29.99/mo',
      support: {
        email: extraData.supportEmail || 'support@nexguard.io',
        phone: extraData.supportPhone || '+254 700 000 000',
      },
      ...extraData,
    },
  });

  return result;
};

// ── Client Chat (Dashboard - Requires Auth) ──────────
const clientChat = async (userId, message, userData = {}) => {
  const config = await getConfig();

  if (!config.masterToggle || !config.toggles.clientDashboard) {
    return { reply: 'AI assistant is currently unavailable.', enabled: false };
  }

  if (!config.apiKey) {
    return { reply: 'AI assistant is not configured.', enabled: false };
  }

  const result = await chat({
    message,
    userId,
    data: {
      user: userData,
      context: `You are NexGuard AI, a cybersecurity assistant. The user is ${userData.name} (${userData.email}). 
      Their plan is ${userData.subscription?.plan || 'Free Trial'} which is ${userData.subscription?.status || 'active'}.
      ${userData.subscription ? `It expires in ${userData.subscription.daysRemaining} days.` : ''}
      They have ${userData.security?.totalAlerts || 0} alerts (${userData.security?.criticalAlerts || 0} critical).
      They have ${userData.security?.totalDevices || 0} of ${userData.security?.deviceLimit || 0} devices activated.
      VPN is ${userData.security?.vpnConnected ? 'connected' : 'disconnected'}.
      Answer all questions based on their actual account data. Be helpful and security-focused.`,
    },
  });

  return result;
};

// ── File Analysis (Requires Auth) ────────────────────
const analyzeFile = async (fileData) => {
  const config = await getConfig();

  if (!config.masterToggle || !config.toggles.fileUploadAnalysis) {
    return { reply: 'AI file analysis is disabled.', enabled: false };
  }

  if (!config.apiKey) {
    return { reply: 'AI is not configured.', enabled: false };
  }

  const result = await chat({
    message: 'Analyze this file for potential threats',
    userId: 'system',
    data: {
      file_name: fileData.name,
      file_size: fileData.size,
      file_type: fileData.type,
      heuristic_flags: fileData.flags || [],
    },
  });

  return result;
};

// ── Public Config (No Auth) ──────────────────────────
const getPublicConfig = async () => {
  const config = await getConfig();
  return {
    enabled: config.masterToggle && config.toggles.landingPage,
    name: config.name,
    greeting: config.defaultGreeting,
    color: config.color,
  };
};

// ── Admin Config ─────────────────────────────────────
const getAdminConfig = async () => {
  return getConfig();
};

module.exports = {
  publicChat,
  clientChat,
  analyzeFile,
  getPublicConfig,
  getAdminConfig,
  getConfig,
};