const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { comparePassword } = require('../../utils/hash');
const Admin = require('../../models/admin/Admin');
const emailService = require('../../services/emailService');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) return sendError(res, 'Invalid email or password', 401);

  const isMatch = await comparePassword(password, admin.password);
  if (!isMatch) return sendError(res, 'Invalid email or password', 401);

  const accessToken = signAccessToken({ id: admin._id, role: admin.role }, true);
  const refreshToken = signRefreshToken({ id: admin._id }, true);

  admin.lastLogin = new Date();
  await admin.save();

  console.log(`  \x1b[32m✅ Admin login: ${admin.email}\x1b[0m`);
  sendSuccess(res, {
    accessToken,
    refreshToken,
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
});

const logout = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Logged out successfully' });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const decoded = verifyRefreshToken(token, true);

  const admin = await Admin.findById(decoded.id);
  if (!admin) return sendError(res, 'Admin not found', 401);

  const accessToken = signAccessToken({ id: admin._id, role: admin.role }, true);
  const newRefreshToken = signRefreshToken({ id: admin._id }, true);

  sendSuccess(res, { accessToken, refreshToken: newRefreshToken });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return sendSuccess(res, { message: 'If the email exists, a reset link has been sent.' });

  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  admin.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  admin.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await admin.save();

  try {
    await emailService.send({
      type: 'adminWelcome',
      to: admin.email,
      data: { name: admin.name, email: admin.email, resetUrl: `${process.env.ADMIN_URL}/reset-password/${resetToken}` },
    });
    console.log(`  \x1b[32m✅ Password reset email sent to: ${admin.email}\x1b[0m`);
  } catch (err) {
    console.log(`  \x1b[31m❌ Failed to send password reset email: ${err.message}\x1b[0m`);
  }

  sendSuccess(res, { message: 'If the email exists, a reset link has been sent.' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const crypto = require('crypto');

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const admin = await Admin.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!admin) return sendError(res, 'Invalid or expired reset token', 400);

  admin.password = await require('../../utils/hash').hashPassword(password);
  admin.passwordResetToken = undefined;
  admin.passwordResetExpires = undefined;
  await admin.save();

  console.log(`  \x1b[32m✅ Password reset completed for: ${admin.email}\x1b[0m`);
  sendSuccess(res, { message: 'Password reset successful' });
});

module.exports = { login, logout, refreshToken, forgotPassword, resetPassword };