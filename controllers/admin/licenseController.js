const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError, sendPaginated, paginateQuery } = require('../../utils/helpers');
const LicenseKey = require('../../models/admin/LicenseKey');
const { generateKey } = require('../../utils/licenseKeyGenerator');
const logger = require('../../utils/logger');

const getLicenses = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = paginateQuery(req.query);
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.plan) filter.plan = req.query.plan;
  if (req.query.user) filter.user = req.query.user;
  if (req.query.search) {
    filter.$or = [
      { key: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [licenses, total] = await Promise.all([
    LicenseKey.find(filter)
      .populate('user', 'name email')
      .sort(sort).skip(skip).limit(limit)
      .lean(),
    LicenseKey.countDocuments(filter),
  ]);

  sendPaginated(res, licenses, { page, limit, total, pages: Math.ceil(total / limit) });
});

const getLicense = asyncHandler(async (req, res) => {
  const license = await LicenseKey.findById(req.params.id)
    .populate('user', 'name email')
    .lean();
  if (!license) return sendError(res, 'License not found', 404);

  sendSuccess(res, license);
});

const generateLicense = asyncHandler(async (req, res) => {
  const { user, plan, deviceLimit } = req.body;

  const key = generateKey(plan);

  const license = await LicenseKey.create({
    key,
    user,
    plan,
    deviceLimit: deviceLimit || 1,
    createdBy: req.admin._id,
  });

  logger.info(`Admin ${req.admin.email} generated license: ${key}`);
  console.log(`  \x1b[32m✅ License generated: ${key} — ${plan}\x1b[0m`);

  sendSuccess(res, license, 201);
});

const revokeLicense = asyncHandler(async (req, res) => {
  const license = await LicenseKey.findById(req.params.id);
  if (!license) return sendError(res, 'License not found', 404);

  if (license.status !== 'active') {
    return sendError(res, 'License is already revoked or expired', 400);
  }

  license.status = 'revoked';
  license.revokedAt = new Date();
  license.revocationReason = req.body.reason || 'Manually revoked by admin';
  await license.save();

  logger.info(`Admin ${req.admin.email} revoked license: ${license.key}`);
  console.log(`  \x1b[31m🗑 License revoked: ${license.key} — ${license.revocationReason}\x1b[0m`);

  sendSuccess(res, { message: 'License revoked', license });
});

const deleteLicense = asyncHandler(async (req, res) => {
  const license = await LicenseKey.findById(req.params.id);
  if (!license) return sendError(res, 'License not found', 404);

  await license.deleteOne();
  console.log(`  \x1b[31m🗑 License deleted: ${license.key}\x1b[0m`);

  sendSuccess(res, { message: 'License deleted' });
});

module.exports = { getLicenses, getLicense, generateLicense, revokeLicense, deleteLicense };