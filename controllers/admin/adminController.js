const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const { hashPassword } = require('../../utils/hash');
const Admin = require('../../models/admin/Admin');
const emailService = require('../../services/emailService');
const logger = require('../../utils/logger');

const getAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select('-password');
  sendSuccess(res, admins);
});

const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await Admin.findOne({ email });
  if (existing) return sendError(res, 'Admin with this email already exists', 400);

  const hashedPassword = await hashPassword(password);
  const admin = await Admin.create({ name, email, password: hashedPassword, role });

  try {
    await emailService.send({
      type: 'adminWelcome',
      to: email,
      data: { name, email, role },
    });
    console.log(`  ${'\x1b[32m'}✅ Welcome email sent to new admin: ${email}${'\x1b[0m'}`);
  } catch (err) {
    console.log(`  ${'\x1b[31m'}❌ Failed to send welcome email: ${err.message}${'\x1b[0m'}`);
  }

  logger.info(`Admin ${req.admin.email} created new admin: ${email}`);
  sendSuccess(res, { admin: { id: admin._id, name, email, role } }, 201);
});

const updateAdminRole = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return sendError(res, 'Admin not found', 404);

  admin.role = req.body.role || admin.role;
  if (req.body.permissions) admin.permissions = req.body.permissions;
  await admin.save();

  console.log(`  ${'\x1b[32m'}✅ Admin role updated: ${admin.email} → ${admin.role}${'\x1b[0m'}`);
  sendSuccess(res, admin);
});

const removeAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return sendError(res, 'Admin not found', 404);

  await admin.deleteOne();
  console.log(`  ${'\x1b[31m'}🗑 Admin removed: ${admin.email}${'\x1b[0m'}`);
  sendSuccess(res, { message: 'Admin removed' });
});

module.exports = { getAdmins, createAdmin, updateAdminRole, removeAdmin };