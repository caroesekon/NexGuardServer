const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError, sendPaginated, paginateQuery } = require('../../utils/helpers');
const PendingApproval = require('../../models/admin/PendingApproval');
const Payment = require('../../models/admin/Payment');
const Subscription = require('../../models/client/Subscription');
const User = require('../../models/client/User');
const Plan = require('../../models/admin/Plan');
const LicenseKey = require('../../models/admin/LicenseKey');
const { generateKey } = require('../../utils/licenseKeyGenerator');
const emailService = require('../../services/emailService');
const socketService = require('../../services/socketService');
const logger = require('../../utils/logger');

const getPendingApprovals = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = paginateQuery(req.query);
  const filter = {};

  if (req.query.type === 'renewal') {
    filter.notes = 'Subscription Renewal';
  } else if (req.query.type === 'new') {
    filter.notes = { $ne: 'Subscription Renewal' };
  }

  filter.status = req.query.status || 'pending';

  const [approvals, total] = await Promise.all([
    PendingApproval.find(filter)
      .populate('user', 'name email')
      .populate('payment', 'amount currency method status createdAt')
      .sort(sort).skip(skip).limit(limit)
      .lean(),
    PendingApproval.countDocuments(filter),
  ]);

  const enriched = approvals.map(a => ({
    _id: a._id,
    user: { name: a.user?.name || 'Unknown', email: a.user?.email || 'Unknown' },
    plan: a.plan,
    billing: a.billing || 'N/A',
    amount: a.amount,
    currency: a.payment?.currency || 'USD',
    paymentMethod: a.payment?.method || 'N/A',
    status: a.status,
    type: a.notes?.includes('Renewal') ? 'renewal' : 'new',
    previousPlan: a.notes?.includes('Renewal') ? a.notes.replace('Renewal from ', '') : null,
    date: a.createdAt,
    proofOfPayment: a.proofOfPayment,
    reviewedBy: a.reviewedBy,
    reviewedAt: a.reviewedAt,
    rejectionReason: a.rejectionReason,
  }));

  sendPaginated(res, enriched, { page, limit, total, pages: Math.ceil(total / limit) });
});

const getPendingApproval = asyncHandler(async (req, res) => {
  const approval = await PendingApproval.findById(req.params.id)
    .populate('user', 'name email')
    .populate('payment', 'amount currency method status')
    .lean();
  if (!approval) return sendError(res, 'Approval not found', 404);

  if (approval.status !== 'pending') {
    return sendError(res, 'This application has already been processed', 400);
  }

  sendSuccess(res, {
    _id: approval._id,
    user: { name: approval.user?.name || 'Unknown', email: approval.user?.email || 'Unknown' },
    plan: approval.plan,
    billing: approval.billing || 'N/A',
    amount: approval.amount,
    currency: approval.payment?.currency || 'USD',
    paymentMethod: approval.payment?.method || 'N/A',
    status: approval.status,
    type: approval.notes?.includes('Renewal') ? 'renewal' : 'new',
    previousPlan: approval.notes?.includes('Renewal') ? approval.notes.replace('Renewal from ', '') : null,
    date: approval.createdAt,
    proofOfPayment: approval.proofOfPayment,
  });
});

const approve = asyncHandler(async (req, res) => {
  const approval = await PendingApproval.findById(req.params.id);
  if (!approval) return sendError(res, 'Approval not found', 404);
  if (approval.status !== 'pending') return sendError(res, 'Already processed', 400);

  approval.status = 'approved';
  approval.reviewedBy = req.admin._id;
  approval.reviewedAt = new Date();
  await approval.save();

  await Payment.findByIdAndUpdate(approval.payment, { status: 'completed' });

const planDoc = await Plan.findOne({ name: { $regex: new RegExp(`^${approval.plan}$`, 'i') } });
  const isRenewal = approval.notes?.includes('Renewal');
  const existingSub = await Subscription.findOne({ user: approval.user });
  let periodEnd;

  if (isRenewal && existingSub) {
    const baseDate = existingSub.currentPeriodEnd > new Date() ? existingSub.currentPeriodEnd : new Date();
    if (approval.billing === 'yearly') periodEnd = new Date(baseDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    else if (approval.billing === 'oneTime') periodEnd = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
    else periodEnd = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    existingSub.status = 'active';
    existingSub.plan = approval.plan;
    existingSub.billing = approval.billing;
    existingSub.currentPeriodEnd = periodEnd;
    existingSub.autoRenew = approval.billing !== 'oneTime';
    if (planDoc) {
      existingSub.deviceLimit = planDoc.deviceLimit;
      existingSub.scansPerDay = planDoc.scansPerDay;
      existingSub.vpnIncluded = planDoc.vpnIncluded;
      existingSub.bandwidthLimitGB = planDoc.bandwidthLimitGB;
    }
    await existingSub.save();
  } else {
    if (approval.billing === 'yearly') periodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    else if (approval.billing === 'oneTime') periodEnd = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
    else periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await Subscription.findOneAndUpdate(
      { user: approval.user },
      {
        status: 'active', plan: approval.plan, billing: approval.billing,
        currentPeriodStart: new Date(), currentPeriodEnd: periodEnd,
        autoRenew: approval.billing !== 'oneTime',
        deviceLimit: planDoc?.deviceLimit || 1,
        scansPerDay: planDoc?.scansPerDay || 100,
        vpnIncluded: planDoc?.vpnIncluded || false,
        bandwidthLimitGB: planDoc?.bandwidthLimitGB || 0,
      },
      { upsert: true, new: true }
    );
  }

  await User.findByIdAndUpdate(approval.user, { status: 'active' });
  const user = await User.findById(approval.user);

  let licenseKey;
  if (isRenewal) {
    const existingLicense = await LicenseKey.findOne({ user: approval.user, status: 'active' });
    if (existingLicense) {
      existingLicense.plan = approval.plan;
      existingLicense.deviceLimit = planDoc?.deviceLimit || existingLicense.deviceLimit;
      existingLicense.expiresAt = periodEnd;
      await existingLicense.save();
      licenseKey = existingLicense.key;
    }
  } else {
    licenseKey = generateKey(approval.plan);
    await LicenseKey.create({
      key: licenseKey, user: approval.user, plan: approval.plan,
      deviceLimit: planDoc?.deviceLimit || 1, expiresAt: periodEnd, createdBy: req.admin._id,
    });
  }

  try {
    await emailService.send({
      type: 'paymentApproved', to: user.email,
      data: { name: user.name, plan: approval.plan, licenseKey: licenseKey || 'Your existing key remains active' },
    });
    if (!isRenewal) await emailService.send({ type: 'welcome', to: user.email, data: { name: user.name } });
    console.log(`  \x1b[32m✅ Approval emails sent to: ${user.email}\x1b[0m`);
  } catch (err) {
    console.log(`  \x1b[31m❌ Approval email failed: ${err.message}\x1b[0m`);
  }

  socketService.emitToUser(user._id.toString(), 'subscription:updated', { plan: approval.plan, status: 'active' });
  socketService.emitToAdmin('admin:approvalResolved', { id: approval._id, status: 'approved' });
  logger.info(`Admin ${req.admin.email} approved ${isRenewal ? 'renewal' : 'payment'} for: ${user.email}`);
  console.log(`  \x1b[32m✅ ${isRenewal ? 'Renewal' : 'Payment'} approved: ${user.email} — ${approval.plan}\x1b[0m`);

  sendSuccess(res, { message: 'Payment approved', approval });
});

const reject = asyncHandler(async (req, res) => {
  const approval = await PendingApproval.findById(req.params.id);
  if (!approval) return sendError(res, 'Approval not found', 404);
  if (approval.status !== 'pending') return sendError(res, 'Already processed', 400);

  const isRenewal = approval.notes?.includes('Renewal');

  approval.status = 'rejected';
  approval.reviewedBy = req.admin._id;
  approval.reviewedAt = new Date();
  approval.rejectionReason = req.body.reason || 'No reason provided';
  await approval.save();

  await Payment.findByIdAndUpdate(approval.payment, { status: 'failed' });

  const user = await User.findById(approval.user);
  if (user && !isRenewal) {
    await LicenseKey.updateMany({ user: approval.user, status: 'active' }, { status: 'revoked', revokedAt: new Date(), revocationReason: 'Application rejected' });
    const userEmail = user.email;
    await user.deleteOne();
    try {
      await emailService.send({ type: 'applicationRejected', to: userEmail, data: { name: user.name, plan: approval.plan, reason: approval.rejectionReason } });
    } catch (err) {
      console.log(`  \x1b[31m❌ Rejection email failed: ${err.message}\x1b[0m`);
    }
  } else if (user && isRenewal) {
    try {
      await emailService.send({ type: 'applicationRejected', to: user.email, data: { name: user.name, plan: approval.plan, reason: approval.rejectionReason } });
    } catch (err) {
      console.log(`  \x1b[31m❌ Rejection email failed: ${err.message}\x1b[0m`);
    }
  }

  logger.info(`Admin ${req.admin.email} rejected for: ${approval.user}`);
  sendSuccess(res, { message: 'Payment rejected', approval });
});

const deleteApproval = asyncHandler(async (req, res) => {
  const approval = await PendingApproval.findById(req.params.id);
  if (!approval) return sendError(res, 'Approval not found', 404);
  if (approval.status === 'pending') return sendError(res, 'Cannot delete pending', 400);
  await approval.deleteOne();
  sendSuccess(res, { message: 'Deleted' });
});

module.exports = { getPendingApprovals, getPendingApproval, approve, reject, deleteApproval };