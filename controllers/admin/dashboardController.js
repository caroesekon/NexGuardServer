const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/helpers');
const User = require('../../models/client/User');
const Subscription = require('../../models/client/Subscription');
const Device = require('../../models/client/Device');
const Alert = require('../../models/client/Alert');
const Scan = require('../../models/client/Scan');
const Payment = require('../../models/admin/Payment');
const PendingApproval = require('../../models/admin/PendingApproval');

const getOverview = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalDevices,
    totalAlerts,
    criticalAlerts,
    totalScans,
    pendingApprovals,
    revenue,
  ] = await Promise.all([
    User.countDocuments({ status: { $ne: 'deleted' } }),
    User.countDocuments({ status: 'active' }),
    Device.countDocuments({ isActive: true }),
    Alert.countDocuments(),
    Alert.countDocuments({ severity: 'critical' }),
    Scan.countDocuments(),
    PendingApproval.countDocuments({ status: 'pending' }),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  sendSuccess(res, {
    users: { total: totalUsers, active: activeUsers },
    devices: totalDevices,
    alerts: { total: totalAlerts, critical: criticalAlerts },
    scans: totalScans,
    pendingApprovals,
    revenue: revenue[0]?.total || 0,
  });
});

const getStats = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    newUsers,
    newAlerts,
    newScans,
    newPayments,
  ] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Alert.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Scan.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Payment.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, status: 'completed' }),
  ]);

  sendSuccess(res, {
    last30Days: { newUsers, newAlerts, newScans, newPayments },
  });
});

const getActiveAgents = asyncHandler(async (req, res) => {
  const agents = await Device.find({ isActive: true })
    .populate('user', 'name email')
    .sort({ lastSeen: -1 })
    .limit(20);

  sendSuccess(res, agents);
});

const getThreatMap = asyncHandler(async (req, res) => {
  const threats = await Alert.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: '$threatType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  sendSuccess(res, threats);
});

module.exports = { getOverview, getStats, getActiveAgents, getThreatMap };