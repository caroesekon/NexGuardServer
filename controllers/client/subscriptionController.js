const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const Subscription = require('../../models/client/Subscription');
const Plan = require('../../models/admin/Plan');
const Payment = require('../../models/admin/Payment');
const emailService = require('../../services/emailService');
const socketService = require('../../services/socketService');

const getPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ isActive: true }).sort('sortOrder');
  sendSuccess(res, plans);
});

const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ user: req.user._id });
  sendSuccess(res, subscription);
});

const startTrial = asyncHandler(async (req, res) => {
  const existing = await Subscription.findOne({ user: req.user._id });
  if (existing && existing.status === 'active') return sendError(res, 'Already have an active subscription', 400);

  const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const sub = await Subscription.findOneAndUpdate(
    { user: req.user._id },
    { plan: 'Free Trial', status: 'trial', trialStart: new Date(), trialEnd, deviceLimit: 1, scansPerDay: 5 },
    { upsert: true, new: true }
  );

  try {
    await emailService.send({
      type: 'trialRegistration',
      to: req.user.email,
      data: { name: req.user.name, trialDays: 30, trialEnd: trialEnd.toISOString().split('T')[0], deviceLimit: 1 },
    });
    console.log(`  \x1b[32m✅ Trial started email sent to: ${req.user.email}\x1b[0m`);
  } catch (err) {
    console.log(`  \x1b[31m❌ Failed to send trial email: ${err.message}\x1b[0m`);
  }

  sendSuccess(res, sub);
});

const upgradePlan = asyncHandler(async (req, res) => {
  const { plan: planName, amount, method } = req.body;

  const payment = await Payment.create({
    user: req.user._id,
    amount,
    method,
    status: 'pending',
  });

  try {
    await emailService.send({
      type: 'paymentReceived',
      to: req.user.email,
      data: { name: req.user.name, plan: planName, amount },
    });
    console.log(`  \x1b[32m✅ Payment received email sent to: ${req.user.email}\x1b[0m`);
  } catch (err) {
    console.log(`  \x1b[31m❌ Failed to send payment email: ${err.message}\x1b[0m`);
  }

  sendSuccess(res, { payment, message: 'Payment submitted. Awaiting approval.' });
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findOne({ user: req.user._id });
  if (!sub) return sendError(res, 'No subscription found', 404);

  sub.status = 'cancelled';
  sub.cancelledAt = new Date();
  sub.cancelReason = req.body.reason;
  await sub.save();

  sendSuccess(res, { message: 'Subscription cancelled', subscription: sub });
});

const getBillingHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id }).sort('-createdAt');
  sendSuccess(res, payments);
});

module.exports = { getPlans, getMySubscription, startTrial, upgradePlan, cancelSubscription, getBillingHistory };