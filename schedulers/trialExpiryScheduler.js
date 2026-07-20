const cron = require('node-cron');
const Subscription = require('../models/client/Subscription');
const emailService = require('../services/emailService');

const checkTrialExpiry = async () => {
  const now = new Date();
  const tenDays = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const fiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const oneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const subscriptions = await Subscription.find({
    status: 'trial',
  }).populate('userId', 'email name');

  for (const sub of subscriptions) {
    const user = sub.userId;
    if (!user) continue;

    if (sub.trialEnd <= oneDay && sub.trialEnd > now) {
      await emailService.send({
        type: 'trialExpired',
        to: user.email,
        data: { name: user.name },
      });
    } else if (sub.trialEnd <= threeDays && sub.trialEnd > oneDay) {
      await emailService.send({
        type: 'trialExpiring3',
        to: user.email,
        data: { name: user.name, daysLeft: 3 },
      });
    } else if (sub.trialEnd <= fiveDays && sub.trialEnd > threeDays) {
      await emailService.send({
        type: 'trialExpiring5',
        to: user.email,
        data: { name: user.name, daysLeft: 5 },
      });
    } else if (sub.trialEnd <= tenDays && sub.trialEnd > fiveDays) {
      await emailService.send({
        type: 'trialExpiring10',
        to: user.email,
        data: { name: user.name, daysLeft: 10 },
      });
    }
  }
};

const start = () => {
  cron.schedule('0 8 * * *', checkTrialExpiry);
  console.log('[Scheduler] Trial expiry checker started (runs daily at 8 AM)');
};

module.exports = { start };