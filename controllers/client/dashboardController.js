const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/helpers');
const Device = require('../../models/client/Device');
const Scan = require('../../models/client/Scan');
const Alert = require('../../models/client/Alert');
const Subscription = require('../../models/client/Subscription');
const VpnSession = require('../../models/client/VpnSession');
const LicenseKey = require('../../models/admin/LicenseKey');

const getOverview = asyncHandler(async (req, res) => {
  const [devices, recentScans, activeAlerts, subscription, vpnSession, license] = await Promise.all([
    LicenseKey.findOne({ user: req.user._id, status: 'active' }),
    Scan.find({ user: req.user._id }).sort('-createdAt').limit(5).lean(),
    Alert.countDocuments({ user: req.user._id, isRead: false }),
    Subscription.findOne({ user: req.user._id }).lean(),
    VpnSession.findOne({ user: req.user._id, status: 'connected' }).lean(),
    LicenseKey.findOne({ user: req.user._id, status: 'active' }).lean(),
  ]);

  sendSuccess(res, {
    devices: license?.devices?.length || 0,
    deviceLimit: license?.deviceLimit || 0,
    recentScans,
    activeAlerts,
    vpnConnected: !!vpnSession,
    subscription: subscription ? {
      plan: subscription.plan,
      status: subscription.status,
      trialEnd: subscription.trialEnd,
      currentPeriodEnd: subscription.currentPeriodEnd,
    } : null,
  });
});

const getProtectionStatus = asyncHandler(async (req, res) => {
  const [criticalAlerts, lastScan] = await Promise.all([
    Alert.countDocuments({ user: req.user._id, severity: 'critical', isRead: false }),
    Scan.findOne({ user: req.user._id }).sort('-createdAt').lean(),
  ]);

  sendSuccess(res, {
    status: criticalAlerts > 0 ? 'at_risk' : lastScan ? 'protected' : 'unscanned',
    criticalAlerts,
    lastScan: lastScan?.createdAt || null,
  });
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const activities = await Alert.find({ user: req.user._id })
    .sort('-createdAt')
    .limit(10)
    .select('threatName severity actionTaken createdAt')
    .lean();

  sendSuccess(res, activities);
});

module.exports = { getOverview, getProtectionStatus, getRecentActivity };