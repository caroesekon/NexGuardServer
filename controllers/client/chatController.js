const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const aiService = require('../../services/aiService');
const Subscription = require('../../models/client/Subscription');
const LicenseKey = require('../../models/admin/LicenseKey');
const Alert = require('../../models/client/Alert');
const Scan = require('../../models/client/Scan');
const Device = require('../../models/client/Device');
const VpnSession = require('../../models/client/VpnSession');
const VaultItem = require('../../models/client/VaultItem');
const Payment = require('../../models/admin/Payment');

const clientChat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) return sendError(res, 'Message is required', 400);

  // Gather all user data
  const [
    subscription,
    license,
    alerts,
    scans,
    devices,
    vpnSessions,
    vaultItems,
    payments,
    alertCount,
    criticalCount,
    scanCount,
  ] = await Promise.all([
    Subscription.findOne({ user: req.user._id }).lean(),
    LicenseKey.find({ user: req.user._id, status: 'active' }).lean(),
    Alert.find({ user: req.user._id }).sort('-createdAt').limit(5).lean(),
    Scan.find({ user: req.user._id }).sort('-createdAt').limit(5).lean(),
    Device.find({ user: req.user._id }).lean(),
    VpnSession.findOne({ user: req.user._id, status: 'connected' }).lean(),
    VaultItem.countDocuments({ user: req.user._id, restored: false }),
    Payment.find({ user: req.user._id, status: 'completed' }).sort('-createdAt').limit(3).lean(),
    Alert.countDocuments({ user: req.user._id }),
    Alert.countDocuments({ user: req.user._id, severity: 'critical' }),
    Scan.countDocuments({ user: req.user._id }),
  ]);

  const totalDevices = license.reduce((sum, l) => sum + l.devices.length, 0);
  const deviceLimit = license[0]?.deviceLimit || 0;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const userData = {
    name: req.user.name,
    email: req.user.email,
    status: req.user.status,
    emailVerified: req.user.emailVerified,
    twoFactorEnabled: req.user.twoFactorEnabled,
    registeredAt: req.user.createdAt,
    lastLogin: req.user.lastLogin,

    subscription: subscription ? {
      plan: subscription.plan,
      status: subscription.status,
      billing: subscription.billing,
      trialStart: subscription.trialStart,
      trialEnd: subscription.trialEnd,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      autoRenew: subscription.autoRenew,
      deviceLimit: subscription.deviceLimit,
      scansPerDay: subscription.scansPerDay,
      vpnIncluded: subscription.vpnIncluded,
      bandwidthLimitGB: subscription.bandwidthLimitGB,
      isExpired: subscription.currentPeriodEnd < new Date(),
      daysRemaining: Math.ceil((new Date(subscription.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24)),
    } : null,

    licenses: license.map(l => ({
      key: l.key,
      plan: l.plan,
      status: l.status,
      devices: l.devices.length,
      deviceLimit: l.deviceLimit,
      expiresAt: l.expiresAt,
    })),

    security: {
      totalAlerts: alertCount,
      criticalAlerts: criticalCount,
      totalScans: scanCount,
      vaultItems,
      vpnConnected: !!vpnSessions,
      totalDevices,
      deviceLimit,
    },

    recentAlerts: alerts.map(a => ({
      threatName: a.threatName,
      severity: a.severity,
      actionTaken: a.actionTaken,
      date: a.createdAt,
    })),

    recentScans: scans.map(s => ({
      scanType: s.scanType,
      filesScanned: s.filesScanned,
      threatsFound: s.threatsFound,
      date: s.createdAt,
    })),

    billing: {
      totalPaid,
      currency: payments[0]?.currency || 'USD',
      recentPayments: payments.map(p => ({
        amount: p.amount,
        method: p.method,
        date: p.createdAt,
      })),
    },
  };

  const result = await aiService.clientChat(req.user._id.toString(), message, userData);
  sendSuccess(res, result);
});

const analyzeFile = asyncHandler(async (req, res) => {
  const { file_name, file_size, file_type, flags } = req.body;
  const result = await aiService.analyzeFile({ name: file_name, size: file_size, type: file_type, flags: flags || [] });
  sendSuccess(res, result);
});

module.exports = { clientChat, analyzeFile };