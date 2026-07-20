const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const { signAccessToken, signRefreshToken } = require('../../utils/jwt');
const { hashPassword } = require('../../utils/hash');
const User = require('../../models/client/User');
const UserSession = require('../../models/client/UserSession');
const Subscription = require('../../models/client/Subscription');
const Payment = require('../../models/admin/Payment');
const PendingApproval = require('../../models/admin/PendingApproval');
const Admin = require('../../models/admin/Admin');
const Setting = require('../../models/admin/Setting');
const emailService = require('../../services/emailService');
const socketService = require('../../services/socketService');

const rates = { USD: 1, EUR: 0.92, GBP: 0.79, KES: 130, NGN: 1600, ZAR: 18.5, GHS: 15.5, TZS: 2700, UGX: 3700 };

const formatMoney = (amount, currency) => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  if (currency === 'USD') return `$${formatted}`;
  if (currency === 'EUR') return `€${formatted}`;
  if (currency === 'GBP') return `£${formatted}`;
  return `${currency} ${formatted}`;
};

const activateFree = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return sendError(res, 'Email already registered', 400);

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ name, email, password: hashedPassword });

  const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await Subscription.create({
    user: user._id,
    plan: 'Free Trial',
    status: 'trial',
    trialStart: new Date(),
    trialEnd,
    deviceLimit: 1,
    scansPerDay: 5,
    vpnIncluded: false,
  });

  try {
    await emailService.send({ type: 'welcome', to: email, data: { name } });
    await emailService.send({
      type: 'trialRegistration',
      to: email,
      data: { name, trialDays: 30, trialEnd: trialEnd.toISOString().split('T')[0], deviceLimit: 1 },
    });
  } catch (err) {
    console.log(`  \x1b[31m❌ Email failed: ${err.message}\x1b[0m`);
  }

  socketService.newUserRegistered({ name, email, plan: 'Free Trial' });

  const accessToken = signAccessToken({ id: user._id });
  const refreshToken = signRefreshToken({ id: user._id });

  await UserSession.create({
    user: user._id,
    refreshToken,
    deviceName: req.body.device_name || 'Unknown',
    ip: req.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  sendSuccess(res, {
    accessToken,
    refreshToken,
    user: { id: user._id, name, email, status: 'active', emailVerified: false },
    subscription: { plan: 'Free Trial', status: 'trial', trialEnd },
  }, 201);
});

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { name, email, password, plan, billing, amount, method, phone, proofOfPayment } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return sendError(res, 'Email already registered', 400);

  const settings = await Setting.findOne();
  const currency = settings?.currency || 'USD';
  const rate = rates[currency] || 1;
  const convertedAmount = Math.round(amount * rate);
  const displayAmount = formatMoney(convertedAmount, currency);

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ name, email, password: hashedPassword, status: 'deactivated' });

  const payment = await Payment.create({
    user: user._id,
    amount: convertedAmount,
    currency,
    method: method?.type || method,
    status: 'pending',
  });

  await PendingApproval.create({
    user: user._id,
    payment: payment._id,
    plan,
    billing,
    amount: convertedAmount,
    proofOfPayment,
  });

  try {
    await emailService.send({ type: 'paymentReceived', to: email, data: { name, plan, amount: displayAmount } });
  } catch (err) {
    console.log(`  \x1b[31m❌ Payment received email failed: ${err.message}\x1b[0m`);
  }

  try {
    const admins = await Admin.find({ role: 'super_admin' }).select('email');
    for (const admin of admins) {
      await emailService.send({ type: 'paymentPendingApproval', to: admin.email, data: { name, email, plan, amount: displayAmount } });
    }
  } catch (err) {
    console.log(`  \x1b[31m❌ Admin notification failed: ${err.message}\x1b[0m`);
  }

  socketService.paymentPending({ name, email, plan, amount: displayAmount });

  sendSuccess(res, {
    message: 'Registration submitted successfully. Your account will be activated and license key sent once payment is approved.',
  }, 201);
});

const handleStripeWebhook = asyncHandler(async (req, res) => { sendSuccess(res, { received: true }); });
const handlePayPalWebhook = asyncHandler(async (req, res) => { sendSuccess(res, { received: true }); });
const handleMpesaCallback = asyncHandler(async (req, res) => { sendSuccess(res, { received: true }); });
const paymentSuccess = asyncHandler(async (req, res) => { sendSuccess(res, { message: 'Payment successful.' }); });
const paymentCancel = asyncHandler(async (req, res) => { sendSuccess(res, { message: 'Payment cancelled.' }); });

module.exports = {
  activateFree,
  createCheckoutSession,
  handleStripeWebhook,
  handlePayPalWebhook,
  handleMpesaCallback,
  paymentSuccess,
  paymentCancel,
};