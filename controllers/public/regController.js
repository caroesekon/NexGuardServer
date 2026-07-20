const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const { signAccessToken, signRefreshToken } = require('../../utils/jwt');
const { hashPassword } = require('../../utils/hash');
const User = require('../../models/client/User');
const UserSession = require('../../models/client/UserSession');
const Subscription = require('../../models/client/Subscription');
const emailService = require('../../services/emailService');
const socketService = require('../../services/socketService');

const register = asyncHandler(async (req, res) => {
  console.log('📥 REGISTER BODY:', JSON.stringify(req.body, null, 2));
  console.log('  plan:', req.body.plan);
  console.log('  billing:', req.body.billing);

  const { name, email, password, plan: selectedPlan, billing } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return sendError(res, 'Email already registered', 400);

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ name, email, password: hashedPassword });

  const isFree = !selectedPlan || selectedPlan === 'free';

  console.log('  isFree:', isFree);

  if (isFree) {
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

    console.log(`  \x1b[32m✅ Free trial registered: ${email}\x1b[0m`);
  } else {
    console.log(`  \x1b[33m⚠ Paid registration: ${email} (${selectedPlan}, ${billing})\x1b[0m`);
  }

  socketService.newUserRegistered({ name, email, plan: isFree ? 'Free Trial' : selectedPlan });

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
    subscription: isFree
      ? { plan: 'Free Trial', status: 'trial', isFree: true }
      : { plan: selectedPlan, billing, status: 'pending_payment', isFree: false },
  }, 201);
});

module.exports = { register };