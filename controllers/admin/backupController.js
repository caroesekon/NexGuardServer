const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError, sendPaginated, paginateQuery } = require('../../utils/helpers');
const Backup = require('../../models/admin/Backup');
const Setting = require('../../models/admin/Setting');
const backupService = require('../../services/backupService');
const emailService = require('../../services/emailService');
const cloudinaryService = require('../../services/cloudinaryService');
const logger = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

// ── Get All Backups ──────────────────────────────────
const getBackups = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = paginateQuery(req.query);
  const filter = {};

  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.frequency) filter.frequency = req.query.frequency;

  const [backups, total] = await Promise.all([
    Backup.find(filter).populate('createdBy', 'name email').sort(sort).skip(skip).limit(limit),
    Backup.countDocuments(filter),
  ]);

  sendPaginated(res, backups, { page, limit, total, pages: Math.ceil(total / limit) });
});

// ── Get Single Backup ────────────────────────────────
const getBackup = asyncHandler(async (req, res) => {
  const backup = await Backup.findById(req.params.id).populate('createdBy', 'name email');
  if (!backup) return sendError(res, 'Backup not found', 404);
  sendSuccess(res, backup);
});

// ── Create Backup Now ────────────────────────────────
const createNow = asyncHandler(async (req, res) => {
  console.log(`  \x1b[36m🔄 Creating backup...\x1b[0m`);

  try {
    const backup = await backupService.createBackup(req.admin._id);

    console.log(`  \x1b[32m✅ Backup created: ${backup.filename} (${(backup.size / 1024 / 1024).toFixed(2)} MB)\x1b[0m`);

    // Auto send to email if enabled in settings
    const settings = await Setting.findOne();
    if (settings?.email?.toggles?.backupCompleted && req.body.sendToEmail) {
      try {
        await emailService.send({
          type: 'backupCompleted',
          to: req.admin.email,
          data: { success: true, filename: backup.filename, size: backup.size },
        });
        console.log(`  \x1b[32m✅ Backup email sent to: ${req.admin.email}\x1b[0m`);
      } catch (err) {
        console.log(`  \x1b[31m❌ Failed to send backup email: ${err.message}\x1b[0m`);
      }
    }

    sendSuccess(res, backup);
  } catch (err) {
    console.log(`  \x1b[31m❌ Backup failed: ${err.message}\x1b[0m`);
    sendError(res, `Backup failed: ${err.message}`, 500);
  }
});

// ── Upload JSON Backup ───────────────────────────────
const uploadBackup = asyncHandler(async (req, res) => {
  if (!req.file) return sendError(res, 'No file uploaded', 400);

  try {
    const result = await cloudinaryService.uploadBuffer(req.file.buffer, 'nexguard-backups');

    const backup = await Backup.create({
      filename: req.file.originalname,
      size: req.file.size,
      location: result.url,
      publicId: result.publicId,
      type: 'manual',
      frequency: 'manual',
      status: 'completed',
      completedAt: new Date(),
      createdBy: req.admin._id,
    });

    console.log(`  \x1b[32m✅ Backup uploaded: ${backup.filename}\x1b[0m`);
    sendSuccess(res, backup, 201);
  } catch (err) {
    console.log(`  \x1b[31m❌ Upload failed: ${err.message}\x1b[0m`);
    sendError(res, `Upload failed: ${err.message}`, 500);
  }
});

// ── Restore Backup ───────────────────────────────────
const restoreBackup = asyncHandler(async (req, res) => {
  try {
    await backupService.restoreBackup(req.params.id);

    const backup = await Backup.findByIdAndUpdate(
      req.params.id,
      { status: 'restored' },
      { new: true }
    );

    console.log(`  \x1b[32m✅ Backup restored: ${backup.filename}\x1b[0m`);
    sendSuccess(res, { message: 'Backup restored successfully', backup });
  } catch (err) {
    console.log(`  \x1b[31m❌ Restore failed: ${err.message}\x1b[0m`);
    sendError(res, `Restore failed: ${err.message}`, 500);
  }
});

// ── Download Backup ──────────────────────────────────
const downloadBackup = asyncHandler(async (req, res) => {
  const backup = await Backup.findById(req.params.id);
  if (!backup) return sendError(res, 'Backup not found', 404);
  if (!backup.location) return sendError(res, 'Backup file not available', 404);

  // Redirect to cloud URL or stream
  res.redirect(backup.location);
});

// ── Send Backup to Email ─────────────────────────────
const sendToEmail = asyncHandler(async (req, res) => {
  const backup = await Backup.findById(req.params.id);
  if (!backup) return sendError(res, 'Backup not found', 404);

  const email = req.body.email || req.admin.email;

  try {
    await emailService.send({
      type: 'backupCompleted',
      to: email,
      data: {
        success: true,
        filename: backup.filename,
        size: backup.size,
        downloadUrl: backup.location,
      },
    });
    console.log(`  \x1b[32m✅ Backup sent to: ${email}\x1b[0m`);
    sendSuccess(res, { message: `Backup sent to ${email}` });
  } catch (err) {
    console.log(`  \x1b[31m❌ Failed to send backup email: ${err.message}\x1b[0m`);
    sendError(res, `Failed to send email: ${err.message}`, 500);
  }
});

// ── Delete Backup ────────────────────────────────────
const deleteBackup = asyncHandler(async (req, res) => {
  const backup = await Backup.findById(req.params.id);
  if (!backup) return sendError(res, 'Backup not found', 404);

  // Delete from cloud if exists
  if (backup.publicId) {
    try {
      await cloudinaryService.deleteFile(backup.publicId);
    } catch (err) {
      console.log(`  \x1b[33m⚠ Cloud delete failed: ${err.message}\x1b[0m`);
    }
  }

  await backup.deleteOne();
  console.log(`  \x1b[31m🗑 Backup deleted: ${backup.filename}\x1b[0m`);
  sendSuccess(res, { message: 'Backup deleted' });
});

// ── Auto Backup Settings ─────────────────────────────
const getAutoBackupSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.findOne();
  sendSuccess(res, {
    autoBackup: settings?.autoBackup || false,
    frequency: settings?.backupFrequency || 'daily',
    sendToEmail: settings?.backupSendToEmail || false,
    emailRecipients: settings?.backupEmailRecipients || [],
  });
});

const updateAutoBackupSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.findOne();
  if (!settings) return sendError(res, 'Settings not found', 404);

  if (req.body.autoBackup !== undefined) settings.autoBackup = req.body.autoBackup;
  if (req.body.frequency) settings.backupFrequency = req.body.frequency;
  if (req.body.sendToEmail !== undefined) settings.backupSendToEmail = req.body.sendToEmail;
  if (req.body.emailRecipients) settings.backupEmailRecipients = req.body.emailRecipients;

  settings.updatedBy = req.admin._id;
  await settings.save();

  console.log(`  \x1b[32m✅ Auto backup settings updated\x1b[0m`);
  sendSuccess(res, {
    autoBackup: settings.autoBackup,
    frequency: settings.backupFrequency,
    sendToEmail: settings.backupSendToEmail,
    emailRecipients: settings.backupEmailRecipients,
  });
});

module.exports = {
  getBackups,
  getBackup,
  createNow,
  uploadBackup,
  restoreBackup,
  downloadBackup,
  sendToEmail,
  deleteBackup,
  getAutoBackupSettings,
  updateAutoBackupSettings,
};