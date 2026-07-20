const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { hashPassword, comparePassword } = require('../../utils/hash');
const User = require('../../models/client/User');
const UserSession = require('../../models/client/UserSession');
const LicenseKey = require('../../models/admin/LicenseKey');
const emailService = require('../../services/emailService');

// ── Login ────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password, device_name, browser, os } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) return sendError(res, 'Invalid email or password', 401);
  if (user.status === 'suspended') return sendError(res, 'Account suspended. Contact support.', 403);
  if (user.status === 'deactivated') return sendError(res, 'Account pending approval. You\'ll be notified once activated.', 402);

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    return sendError(res, 'Invalid email or password', 401);
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return sendError(res, `Account locked until ${user.lockedUntil.toLocaleString()}`, 423);
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  user.lastLogin = new Date();
  user.lastLoginIp = req.ip;
  await user.save();

  const accessToken = signAccessToken({ id: user._id });
  const refreshToken = signRefreshToken({ id: user._id });

  await UserSession.create({
    user: user._id,
    refreshToken,
    deviceName: device_name || 'Unknown',
    browser,
    os,
    ip: req.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const license = await LicenseKey.findOne({ user: user._id, status: 'active' });
  let needsActivation = false;
  if (license && license.devices.length === 0) {
    needsActivation = true;
  }

  console.log(`  \x1b[32m✅ User login: ${user.email}${needsActivation ? ' (needs device activation)' : ''}\x1b[0m`);

  sendSuccess(res, {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    },
    license: license ? {
      key: license.key,
      plan: license.plan,
      devices: license.devices.length,
      deviceLimit: license.deviceLimit,
    } : null,
    needsActivation,
  });
});

// ── Refresh Token ────────────────────────────────────
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const decoded = verifyRefreshToken(token);

  const session = await UserSession.findOne({ user: decoded.id, refreshToken: token });
  if (!session) return sendError(res, 'Invalid refresh token', 401);

  const user = await User.findById(decoded.id);
  if (!user) return sendError(res, 'User not found', 401);

  const accessToken = signAccessToken({ id: user._id });
  const newRefreshToken = signRefreshToken({ id: user._id });

  session.refreshToken = newRefreshToken;
  await session.save();

  sendSuccess(res, { accessToken, refreshToken: newRefreshToken });
});

// ── Logout ───────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await UserSession.deleteMany({ user: req.user._id });
  }
  console.log(`  \x1b[33m⚠ User logout: ${req.user?.email || 'unknown'}\x1b[0m`);
  sendSuccess(res, { message: 'Logged out successfully' });
});

// ── Forgot Password ──────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return sendSuccess(res, { message: 'If the email exists, a reset link has been sent.' });

  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  try {
    await emailService.send({
      type: 'passwordReset',
      to: user.email,
      data: { name: user.name, resetUrl: `${process.env.CLIENT_URL}/reset-password/${resetToken}` },
    });
    console.log(`  \x1b[32m✅ Password reset email sent to: ${user.email}\x1b[0m`);
  } catch (err) {
    console.log(`  \x1b[31m❌ Failed to send password reset email: ${err.message}\x1b[0m`);
  }

  sendSuccess(res, { message: 'If the email exists, a reset link has been sent.' });
});

// ── Reset Password ───────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const crypto = require('crypto');

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) return sendError(res, 'Invalid or expired reset token', 400);

  user.password = await hashPassword(password);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  try {
    await emailService.send({ type: 'passwordChanged', to: user.email, data: { name: user.name } });
    console.log(`  \x1b[32m✅ Password changed email sent to: ${user.email}\x1b[0m`);
  } catch (err) {
    console.log(`  \x1b[31m❌ Failed to send password changed email: ${err.message}\x1b[0m`);
  }

  sendSuccess(res, { message: 'Password reset successful' });
});

// ── Verify Email ─────────────────────────────────────
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const crypto = require('crypto');

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) return sendError(res, 'Invalid or expired verification token', 400);

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  console.log(`  \x1b[32m✅ Email verified: ${user.email}\x1b[0m`);
  sendSuccess(res, { message: 'Email verified successfully' });
});

// ── Resend Verification ──────────────────────────────
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return sendSuccess(res, { message: 'If the email exists, a verification link has been sent.' });
  if (user.emailVerified) return sendSuccess(res, { message: 'Email already verified.' });

  const crypto = require('crypto');
  const verifyToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  try {
    await emailService.send({
      type: 'verifyEmail',
      to: user.email,
      data: { name: user.name, verificationUrl: `${process.env.CLIENT_URL}/verify-email/${verifyToken}` },
    });
    console.log(`  \x1b[32m✅ Verification email sent to: ${user.email}\x1b[0m`);
  } catch (err) {
    console.log(`  \x1b[31m❌ Failed to send verification email: ${err.message}\x1b[0m`);
  }

  sendSuccess(res, { message: 'Verification email sent' });
});

// ── Check Email ──────────────────────────────────────
const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email });
  sendSuccess(res, { available: !user });
});

module.exports = {
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  checkEmail,
};