const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const LicenseKey = require('../../models/admin/LicenseKey');
const { validateKey } = require('../../utils/licenseKeyGenerator');

const checkLicense = asyncHandler(async (req, res) => {
  const { license_key, device_id } = req.body;

  if (!license_key) return sendError(res, 'License key is required', 400);
  if (!validateKey(license_key)) return sendError(res, 'Invalid license key format', 400);

  const license = await LicenseKey.findOne({ key: license_key }).populate('user', 'name email status');
  if (!license) return sendError(res, 'License key not found', 404);

  if (license.status === 'revoked') return sendError(res, 'License has been revoked', 403);
  if (license.status === 'expired') return sendError(res, 'License has expired', 403);
  if (license.expiresAt && license.expiresAt < new Date()) {
    license.status = 'expired';
    await license.save();
    return sendError(res, 'License has expired', 403);
  }

  if (!license.user || license.user.status !== 'active') {
    return sendError(res, 'Account is not active', 403);
  }

  // Register device if provided
  if (device_id) {
    const deviceExists = license.devices.find(d => d.deviceId === device_id);
    if (!deviceExists) {
      if (license.devices.length >= license.deviceLimit) {
        return sendError(res, `Device limit reached (${license.deviceLimit})`, 403);
      }
      license.devices.push({
        deviceId: device_id,
        deviceName: req.body.device_name || 'Unknown Device',
        activatedAt: new Date(),
      });
      if (!license.activatedAt) {
        license.activatedAt = new Date();
      }
      await license.save();
    }
  }

  sendSuccess(res, {
    valid: true,
    key: license.key,
    plan: license.plan,
    deviceLimit: license.deviceLimit,
    devices: license.devices.length,
    expiresAt: license.expiresAt,
    user: {
      name: license.user?.name,
      email: license.user?.email,
    },
  });
});

module.exports = { checkLicense };