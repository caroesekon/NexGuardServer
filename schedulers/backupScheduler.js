const cron = require('node-cron');
const backupService = require('../services/backupService');
const logger = require('../utils/logger');

const runScheduledBackup = async () => {
  try {
    logger.info('[Scheduler] Starting scheduled backup...');
    const backup = await backupService.createBackup(null);
    logger.info(`[Scheduler] Backup completed: ${backup.filename}`);
  } catch (error) {
    logger.error(`[Scheduler] Backup failed: ${error.message}`);
  }
};

const start = () => {
  cron.schedule('0 3 * * *', runScheduledBackup);
  console.log('[Scheduler] Backup scheduler started (runs daily at 3 AM)');
};

module.exports = { start };