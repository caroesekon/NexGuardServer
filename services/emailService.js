const { sendEmail } = require('../config/hdmBridge');
const systemTemplates = require('../templates/system');
const clientTemplates = require('../templates/client');
const Setting = require('../models/admin/Setting');

const getConfig = async () => {
  const settings = await Setting.findOne();
  const email = settings?.email || {};

  return {
    senderName: email.senderName || 'NexGuard',
    senderEmail: email.senderEmail || 'noreply@nexguard.io',
    toggles: email.toggles || {},
  };
};

const isEnabled = async (type) => {
  const config = await getConfig();
  const toggleMap = {
    welcome: 'welcomeEmail',
    welcomeEmail: 'welcomeEmail',
    verifyEmail: 'verifyEmail',
    passwordReset: 'passwordReset',
    passwordChanged: 'passwordChanged',
    loginNewDevice: 'newDeviceLogin',
    accountLocked: 'accountLocked',
    accountDeleted: 'accountDeleted',
    accountSuspended: 'accountSuspended',
    accountReactivated: 'accountReactivated',
    accountDeactivated: 'accountDeactivated',
    trialRegistration: 'trialRegistration',
    trialExpiring10: 'trialExpiring',
    trialExpiring5: 'trialExpiring',
    trialExpiring3: 'trialExpiring',
    trialExpired: 'trialExpired',
    paymentReceived: 'paymentReceived',
    paymentApproved: 'paymentApproved',
    vpnSessionAlert: 'vpnConnected',
    backupCompleted: 'backupCompleted',
    systemHealthAlert: 'systemHealthAlert',
    criticalThreatAlert: 'criticalThreatAlert',
    newUserRegistration: 'newUserRegistration',
    paymentPendingApproval: 'paymentPendingApproval',
    adminWelcome: null,
  };

  const toggle = toggleMap[type];
  if (toggle === null) return true;
  return config.toggles[toggle] ?? true;
};

const send = async ({ type, to, data }) => {
  const enabled = await isEnabled(type);

  if (!enabled) {
    console.log(`  \x1b[33m⚠ Email skipped (disabled): ${type} → ${to}\x1b[0m`);
    return { sent: false, reason: 'disabled' };
  }

  const templates = { ...systemTemplates, ...clientTemplates };
  const template = templates[type];

  if (!template) {
    throw new Error(`Email template not found: ${type}`);
  }

  const { subject, html, text } = await template(data);

  try {
    await sendEmail({ to, subject, htmlBody: html, textBody: text });
    console.log(`  \x1b[32m✅ Email sent: ${type} → ${to}\x1b[0m`);
    return { sent: true };
  } catch (err) {
    console.log(`  \x1b[31m❌ Email failed: ${type} → ${to} — ${err.message}\x1b[0m`);
    return { sent: false, error: err.message };
  }
};

module.exports = { send, getConfig };