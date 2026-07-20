const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const { hashPassword, comparePassword } = require('../../utils/hash');
const User = require('../../models/client/User');
const UserSession = require('../../models/client/UserSession');
const emailService = require('../../services/emailService');
const speakeasy = require('speakeasy');

// ── Profile ──────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, req.user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (name) req.user.name = name;
  await req.user.save();
  console.log(`  \x1b[32m✅ Profile updated: ${req.user.email}\x1b[0m`);
  sendSuccess(res, req.user);
});

// ── Password ─────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) return sendError(res, 'Current password is incorrect', 400);

  user.password = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save();

  try {
    await emailService.send({ type: 'passwordChanged', to: user.email, data: { name: user.name } });
    console.log(`  \x1b[32m✅ Password changed email sent to: ${user.email}\x1b[0m`);
  } catch (err) {
    console.log(`  \x1b[31m❌ Failed to send password changed email: ${err.message}\x1b[0m`);
  }

  sendSuccess(res, { message: 'Password changed successfully' });
});

// ── Avatar ───────────────────────────────────────────
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return sendError(res, 'No file uploaded', 400);

  const cloudinaryService = require('../../services/cloudinaryService');
  const result = await cloudinaryService.uploadBuffer(req.file.buffer, 'nexguard-avatars');

  req.user.avatar = { publicId: result.publicId, url: result.url };
  await req.user.save();

  console.log(`  \x1b[32m✅ Avatar updated: ${req.user.email}\x1b[0m`);
  sendSuccess(res, { avatar: req.user.avatar });
});

// ── Delete Account ───────────────────────────────────
const deleteAccount = asyncHandler(async (req, res) => {
  try {
    await emailService.send({ type: 'accountDeleted', to: req.user.email, data: { name: req.user.name } });
    console.log(`  \x1b[31m🗑 Account deletion email sent to: ${req.user.email}\x1b[0m`);
  } catch (err) {
    console.log(`  \x1b[31m❌ Failed to send deletion email: ${err.message}\x1b[0m`);
  }

  await UserSession.deleteMany({ user: req.user._id });
  await req.user.deleteOne();
  sendSuccess(res, { message: 'Account deleted' });
});

// ── Sessions ─────────────────────────────────────────
const getSessions = asyncHandler(async (req, res) => {
  const sessions = await UserSession.find({ user: req.user._id, isActive: true });
  sendSuccess(res, sessions);
});

const revokeSession = asyncHandler(async (req, res) => {
  await UserSession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  sendSuccess(res, { message: 'Session revoked' });
});

// ── 2FA ──────────────────────────────────────────────
const enable2FA = asyncHandler(async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `NexGuard:${req.user.email}`,
    length: 20,
  });

  req.user.twoFactorSecret = secret.base32;
  req.user.twoFactorEnabled = false;
  await req.user.save();

  sendSuccess(res, {
    secret: secret.base32,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(secret.otpauth_url)}`,
  });
});

const verify2FA = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const verified = speakeasy.totp.verify({
    secret: req.user.twoFactorSecret,
    encoding: 'base32',
    token: code,
  });

  if (!verified) return sendError(res, 'Invalid code', 400);

  req.user.twoFactorEnabled = true;
  await req.user.save();

  sendSuccess(res, { message: '2FA enabled successfully' });
});

const disable2FA = asyncHandler(async (req, res) => {
  req.user.twoFactorSecret = undefined;
  req.user.twoFactorEnabled = false;
  await req.user.save();

  sendSuccess(res, { message: '2FA disabled' });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAccount,
  getSessions,
  revokeSession,
  enable2FA,
  verify2FA,
  disable2FA,
};