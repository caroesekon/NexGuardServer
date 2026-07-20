const cron = require('node-cron');
const Subscription = require('../models/client/Subscription');
const User = require('../models/client/User');
const LicenseKey = require('../models/admin/LicenseKey');
const emailService = require('../services/emailService');

const processSubscriptions = async () => {
  const now = new Date();

  // Expire trials that ended
  const expiredTrials = await Subscription.updateMany(
    { status: 'trial', trialEnd: { $lt: now } },
    { status: 'expired' }
  );
  if (expiredTrials.modifiedCount > 0) {
    console.log(`[Scheduler] ${expiredTrials.modifiedCount} trials expired`);
  }

  // Expire paid subscriptions that ended
  const expiredSubs = await Subscription.find({
    status: 'active',
    currentPeriodEnd: { $lt: now },
  });

  for (const sub of expiredSubs) {
    sub.status = 'expired';
    sub.autoRenew = false;
    await sub.save();

    // Revoke license
    await LicenseKey.updateMany(
      { user: sub.user, status: 'active' },
      { status: 'expired', revocationReason: 'Subscription expired' }
    );

    // Notify user
    try {
      const user = await User.findById(sub.user);
      if (user) {
        await emailService.send({
          type: 'trialExpired',
          to: user.email,
          data: { name: user.name },
        });
      }
    } catch (err) {
      console.log(`[Scheduler] Email failed: ${err.message}`);
    }
  }

  if (expiredSubs.length > 0) {
    console.log(`[Scheduler] ${expiredSubs.length} subscriptions expired`);
  }

  // Notify expiring soon (3 days before)
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const expiringSoon = await Subscription.find({
    status: 'active',
    currentPeriodEnd: { $lte: threeDaysFromNow, $gt: now },
  }).populate('user', 'name email');

  for (const sub of expiringSoon) {
    try {
      if (sub.user) {
        await emailService.send({
          type: 'trialExpiring3',
          to: sub.user.email,
          data: { name: sub.user.name, trialEnd: sub.currentPeriodEnd.toISOString().split('T')[0], daysLeft: 3 },
        });
      }
    } catch (err) {
      console.log(`[Scheduler] Email failed: ${err.message}`);
    }
  }

  if (expiringSoon.length > 0) {
    console.log(`[Scheduler] ${expiringSoon.length} subscriptions expiring soon`);
  }
};

const start = () => {
  cron.schedule('*/15 * * * *', processSubscriptions);
  console.log('[Scheduler] Subscription processor started (runs every 15 minutes)');
};

module.exports = { start };