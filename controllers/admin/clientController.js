const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');
const { sendSuccess, sendError, sendPaginated, paginateQuery } = require('../../utils/helpers');
const User = require('../../models/client/User');
const Subscription = require('../../models/client/Subscription');
const Device = require('../../models/client/Device');
const Alert = require('../../models/client/Alert');
const Scan = require('../../models/client/Scan');
const VpnSession = require('../../models/client/VpnSession');
const VaultItem = require('../../models/client/VaultItem');
const Payment = require('../../models/admin/Payment');
const LicenseKey = require('../../models/admin/LicenseKey');
const emailService = require('../../services/emailService');
const socketService = require('../../services/socketService');
const logger = require('../../utils/logger');

const getClients = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = paginateQuery(req.query);
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [clients, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit).select('-password').lean(),
    User.countDocuments(filter),
  ]);

  const userIds = clients.map(c => c._id);
  const [subscriptions, alerts, scans, payments, licenses] = await Promise.all([
    Subscription.find({ user: { $in: userIds } }).lean(),
    Alert.find({ user: { $in: userIds } }).lean(),
    Scan.find({ user: { $in: userIds } }).lean(),
    Payment.find({ user: { $in: userIds }, status: 'completed' }).lean(),
    LicenseKey.find({ user: { $in: userIds }, status: 'active' }).lean(),
  ]);

  const subMap = {};
  subscriptions.forEach(s => { subMap[s.user.toString()] = s; });

  const alertMap = {};
  alerts.forEach(a => { alertMap[a.user.toString()] = (alertMap[a.user.toString()] || 0) + 1; });

  const scanMap = {};
  scans.forEach(s => { scanMap[s.user.toString()] = (scanMap[s.user.toString()] || 0) + 1; });

  const paymentMap = {};
  payments.forEach(p => { paymentMap[p.user.toString()] = (paymentMap[p.user.toString()] || 0) + p.amount; });

  const licenseMap = {};
  licenses.forEach(l => {
    licenseMap[l.user.toString()] = {
      key: l.key, plan: l.plan, devices: l.devices.length,
      deviceLimit: l.deviceLimit, status: l.status, expiresAt: l.expiresAt,
    };
  });

  const enriched = clients.map(c => ({
    _id: c._id, name: c.name, email: c.email, avatar: c.avatar, status: c.status,
    plan: subMap[c._id.toString()]?.plan || (c.status === 'deactivated' ? 'Pending' : 'None'),
    subscriptionStatus: subMap[c._id.toString()]?.status || 'none',
    billing: subMap[c._id.toString()]?.billing || null,
    trialStart: subMap[c._id.toString()]?.trialStart || null,
    trialEnd: subMap[c._id.toString()]?.trialEnd || null,
    currentPeriodStart: subMap[c._id.toString()]?.currentPeriodStart || null,
    currentPeriodEnd: subMap[c._id.toString()]?.currentPeriodEnd || null,
    registeredAt: c.createdAt,
    lastLogin: c.lastLogin,
    emailVerified: c.emailVerified,
    twoFactorEnabled: c.twoFactorEnabled,
    devices: licenseMap[c._id.toString()]?.devices || 0,
    deviceLimit: licenseMap[c._id.toString()]?.deviceLimit || 0,
    alerts: alertMap[c._id.toString()] || 0,
    scans: scanMap[c._id.toString()] || 0,
    totalPaid: paymentMap[c._id.toString()] || 0,
    license: licenseMap[c._id.toString()] || null,
  }));

  sendPaginated(res, enriched, { page, limit, total, pages: Math.ceil(total / limit) });
});

const getClient = asyncHandler(async (req, res) => {
  const client = await User.findById(req.params.id).select('-password').lean();
  if (!client) return sendError(res, 'Client not found', 404);

  const [subscription, devices, alerts, scans, payments, vpnSessions, vaultItems, licenses] = await Promise.all([
    Subscription.findOne({ user: client._id }).lean(),
    Device.find({ user: client._id }).lean(),
    Alert.find({ user: client._id }).sort('-createdAt').limit(20).lean(),
    Scan.find({ user: client._id }).sort('-createdAt').limit(10).lean(),
    Payment.find({ user: client._id }).sort('-createdAt').lean(),
    VpnSession.find({ user: client._id }).sort('-createdAt').limit(10).lean(),
    VaultItem.find({ user: client._id, restored: false }).lean(),
    LicenseKey.find({ user: client._id }).lean(),
  ]);

  sendSuccess(res, {
    _id: client._id, name: client.name, email: client.email, avatar: client.avatar,
    status: client.status, emailVerified: client.emailVerified,
    twoFactorEnabled: client.twoFactorEnabled,
    registeredAt: client.createdAt, lastLogin: client.lastLogin, lastLoginIp: client.lastLoginIp,

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
      cancelledAt: subscription.cancelledAt,
      cancelReason: subscription.cancelReason,
    } : null,

    licenses: licenses.map(l => ({
      _id: l._id, key: l.key, plan: l.plan, status: l.status,
      devices: l.devices, deviceLimit: l.deviceLimit,
      activatedAt: l.activatedAt, expiresAt: l.expiresAt, createdAt: l.createdAt,
    })),

    devices: devices.map(d => ({
      _id: d._id, deviceName: d.deviceName, deviceId: d.deviceId,
      os: d.os, osVersion: d.osVersion, agentVersion: d.agentVersion,
      ip: d.ip, lastSeen: d.lastSeen, isActive: d.isActive, status: d.status, createdAt: d.createdAt,
    })),

    stats: {
      totalLicenses: licenses.length,
      activeLicenses: licenses.filter(l => l.status === 'active').length,
      totalDevices: licenses.reduce((sum, l) => sum + l.devices.length, 0),
      totalAlerts: await Alert.countDocuments({ user: client._id }),
      criticalAlerts: await Alert.countDocuments({ user: client._id, severity: 'critical' }),
      totalScans: await Scan.countDocuments({ user: client._id }),
      totalVpnSessions: vpnSessions.length,
      vaultItems: vaultItems.length,
      totalPaid: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    },

    recentAlerts: alerts.slice(0, 5),
    recentScans: scans.slice(0, 5),
    recentPayments: payments.slice(0, 5).map(p => ({
      _id: p._id, amount: p.amount, currency: p.currency,
      method: p.method, status: p.status, createdAt: p.createdAt,
    })),
  });
});

const suspendClient = asyncHandler(async (req, res) => {
  const client = await User.findById(req.params.id);
  if (!client) return sendError(res, 'Client not found', 404);
  client.status = 'suspended';
  await client.save();

  try {
    await emailService.send({ type: 'accountSuspended', to: client.email, data: { name: client.name, reason: req.body.reason || 'Violation of Terms' } });
  } catch (err) {
    console.log(`  \x1b[31m❌ Email failed: ${err.message}\x1b[0m`);
  }

  socketService.emitToUser(client._id.toString(), 'account:suspended', {});
  logger.info(`Admin ${req.admin.email} suspended user: ${client.email}`);
  sendSuccess(res, { message: 'Client suspended', client });
});

const reactivateClient = asyncHandler(async (req, res) => {
  const client = await User.findById(req.params.id);
  if (!client) return sendError(res, 'Client not found', 404);
  client.status = 'active';
  client.failedLoginAttempts = 0;
  client.lockedUntil = undefined;
  await client.save();

  try {
    await emailService.send({ type: 'accountReactivated', to: client.email, data: { name: client.name } });
  } catch (err) {
    console.log(`  \x1b[31m❌ Email failed: ${err.message}\x1b[0m`);
  }

  socketService.emitToUser(client._id.toString(), 'account:reactivated', {});
  logger.info(`Admin ${req.admin.email} reactivated user: ${client.email}`);
  sendSuccess(res, { message: 'Client reactivated', client });
});

const deleteClient = asyncHandler(async (req, res) => {
  const client = await User.findById(req.params.id);
  if (!client) return sendError(res, 'Client not found', 404);

  try {
    await emailService.send({ type: 'accountDeleted', to: client.email, data: { name: client.name } });
  } catch (err) {
    console.log(`  \x1b[31m❌ Email failed: ${err.message}\x1b[0m`);
  }

  await client.deleteOne();
  logger.info(`Admin ${req.admin.email} deleted user: ${client.email}`);
  sendSuccess(res, { message: 'Client deleted' });
});

module.exports = { getClients, getClient, suspendClient, reactivateClient, deleteClient };