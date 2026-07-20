const trialExpiryScheduler = require('./trialExpiryScheduler');
const subscriptionScheduler = require('./subscriptionScheduler');
const backupScheduler = require('./backupScheduler');

const initSchedulers = () => {
  trialExpiryScheduler.start();
  subscriptionScheduler.start();
  backupScheduler.start();
};

module.exports = { initSchedulers };