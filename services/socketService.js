const { getIO } = require('../config/socket');

const emitToUser = (userId, event, data) => {
  const io = getIO();
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

const emitToAdmin = (event, data) => {
  const io = getIO();
  if (!io) return;
  io.to('admin').emit(event, data);
};

const emitToDevice = (deviceId, event, data) => {
  const io = getIO();
  if (!io) return;
  io.to(`device:${deviceId}`).emit(event, data);
};

// ── User Events ──────────────────────────────────────
const alertUser = (userId, alert) => emitToUser(userId, 'alert:new', alert);
const scanProgress = (userId, progress) => emitToUser(userId, 'scan:progress', progress);
const scanComplete = (userId, result) => emitToUser(userId, 'scan:complete', result);
const vpnConnected = (userId, session) => emitToUser(userId, 'vpn:connected', session);
const vpnDisconnected = (userId) => emitToUser(userId, 'vpn:disconnected', {});
const subscriptionUpdated = (userId, plan) => emitToUser(userId, 'subscription:updated', plan);

// ── Admin Events ─────────────────────────────────────
const newUserRegistered = (user) => emitToAdmin('admin:newUser', user);
const paymentPending = (payment) => emitToAdmin('admin:paymentPending', payment);
const criticalThreat = (threat) => emitToAdmin('admin:threatCritical', threat);
const systemHealth = (status) => emitToAdmin('admin:systemHealth', status);

module.exports = {
  emitToUser,
  emitToAdmin,
  emitToDevice,
  alertUser,
  scanProgress,
  scanComplete,
  vpnConnected,
  vpnDisconnected,
  subscriptionUpdated,
  newUserRegistered,
  paymentPending,
  criticalThreat,
  systemHealth,
};