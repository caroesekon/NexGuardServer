const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const User = require('../../models/client/User');
const Subscription = require('../../models/client/Subscription');
const Payment = require('../../models/admin/Payment');
const PendingApproval = require('../../models/admin/PendingApproval');
const Setting = require('../../models/admin/Setting');
const Admin = require('../../models/admin/Admin');
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

const renewSubscription = asyncHandler(async (req, res) => {
  const { name, email, plan, billing, amount, method, phone, proofOfPayment } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) return sendError(res, 'Account not found. Please login to renew.', 404);

  const settings = await Setting.findOne();
  const currency = settings?.currency || 'USD';
  const rate = rates[currency] || 1;
  const convertedAmount = Math.round(amount * rate);
  const displayAmount = formatMoney(convertedAmount, currency);

  const payment = await Payment.create({
    user: user._id,
    amount: convertedAmount,
    currency,
    method: method?.type || method,
    status: 'pending',
    metadata: { type: 'renewal', previousPlan: user.subscription?.plan },
  });

  await PendingApproval.create({
    user: user._id,
    payment: payment._id,
    plan,
    billing,
    amount: convertedAmount,
    proofOfPayment,
    notes: 'Subscription Renewal',
  });

  try {
    await emailService.send({
      type: 'paymentReceived',
      to: email,
      data: { name: name || user.name, plan, amount: displayAmount },
    });
  } catch (err) {
    console.log(`  \x1b[31m❌ Payment received email failed: ${err.message}\x1b[0m`);
  }

  try {
    const admins = await Admin.find({ role: 'super_admin' }).select('email');
    for (const admin of admins) {
      await emailService.send({
        type: 'paymentPendingApproval',
        to: admin.email,
        data: { name: name || user.name, email, plan, amount: displayAmount },
      });
    }
  } catch (err) {
    console.log(`  \x1b[31m❌ Admin notification failed: ${err.message}\x1b[0m`);
  }

  socketService.paymentPending({
    name: name || user.name,
    email,
    plan,
    amount: displayAmount,
  });

  console.log(`  \x1b[33m🔄 Renewal submitted: ${email} — ${plan} (${billing}) — ${displayAmount}\x1b[0m`);

  sendSuccess(res, {
    message: 'Renewal submitted successfully. Your subscription will be updated once payment is approved.',
  });
});

module.exports = { renewSubscription };