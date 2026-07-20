const AppError = require('../../utils/AppError');
const Device = require('../../models/client/Device');

const checkDeviceLimit = async (req, res, next) => {
  try {
    const limit = req.subscription?.deviceLimit || 1;

    const deviceCount = await Device.countDocuments({
      userId: req.user._id,
    });

    if (deviceCount >= limit) {
      return next(
        new AppError(
          `Device limit reached (${limit}). Remove a device or upgrade your plan.`,
          403
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkDeviceLimit };