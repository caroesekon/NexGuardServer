const AppError = require('../../utils/AppError');
const Subscription = require('../../models/client/Subscription');

const checkSubscription = async (req, res, next) => {
  try {
    // Check user status first
    if (req.user.status === 'deactivated') {
      return next(new AppError('Your account is pending approval. You\'ll be notified once activated.', 402));
    }

    if (req.user.status === 'suspended') {
      return next(new AppError('Your account has been suspended.', 403));
    }

    const subscription = await Subscription.findOne({ user: req.user._id });

    if (!subscription) {
      return next(new AppError('No subscription found. Please subscribe.', 403));
    }

    const now = new Date();

    if (subscription.status === 'trial') {
      if (subscription.trialEnd < now) {
        subscription.status = 'expired';
        await subscription.save();
        return next(new AppError('Your trial has expired. Please upgrade to continue.', 403));
      }
    }

    if (subscription.status === 'active') {
      if (subscription.currentPeriodEnd < now) {
        subscription.status = 'expired';
        subscription.autoRenew = false;
        await subscription.save();
        return next(new AppError('Your subscription has expired. Please renew to continue.', 403));
      }
    }

    if (subscription.status === 'expired') {
      return next(new AppError('Your subscription has expired. Please renew to continue.', 403));
    }

    if (subscription.status === 'cancelled') {
      if (subscription.currentPeriodEnd < now) {
        return next(new AppError('Your subscription has ended. Please subscribe.', 403));
      }
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkSubscription };