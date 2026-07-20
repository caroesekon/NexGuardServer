const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['super_admin', 'moderator', 'billing_admin'],
      default: 'moderator',
    },
    permissions: {
      users: { type: Boolean, default: false },
      payments: { type: Boolean, default: false },
      plans: { type: Boolean, default: false },
      settings: { type: Boolean, default: false },
      backups: { type: Boolean, default: false },
      legal: { type: Boolean, default: false },
      admins: { type: Boolean, default: false },
    },
    notificationSettings: {
      email: {
        newUserRegistration: { type: Boolean, default: true },
        paymentPendingApproval: { type: Boolean, default: true },
        userUpgradedPlan: { type: Boolean, default: false },
        criticalThreatAlert: { type: Boolean, default: true },
        systemHealthAlert: { type: Boolean, default: true },
        dailySummary: { type: Boolean, default: false },
        weeklyReport: { type: Boolean, default: false },
        backupCompleted: { type: Boolean, default: true },
        newAdminAdded: { type: Boolean, default: false },
        licenseKeysGenerated: { type: Boolean, default: false },
      },
      inApp: {
        paymentPendingApproval: { type: Boolean, default: true },
        criticalThreatAlert: { type: Boolean, default: true },
        systemHealthAlert: { type: Boolean, default: true },
        newUserRegistration: { type: Boolean, default: true },
      },
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);