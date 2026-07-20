const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    // ── General ────────────────────────────────────
    appName: { type: String, default: 'NexGuard' },
    logo: String,
    favicon: String,
    supportEmail: { type: String, default: 'support@nexguard.io' },
    supportPhone: { type: String, default: '+254 700 000 000' },
    currency: { type: String, default: 'USD' },
    rateLimitWindow: { type: Number, default: 15 },
    rateLimitMax: { type: Number, default: 100 },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },

    // ── Downloads ──────────────────────────────────
    downloads: {
      desktop: {
        windows: {
          url: { type: String, default: '' },
          version: { type: String, default: '1.0.0' },
          available: { type: Boolean, default: true },
        },
        macos: {
          url: { type: String, default: '' },
          version: { type: String, default: '1.0.0' },
          available: { type: Boolean, default: true },
        },
        linux: {
          url: { type: String, default: '' },
          version: { type: String, default: '1.0.0' },
          available: { type: Boolean, default: true },
        },
      },
      mobile: {
        android: {
          url: { type: String, default: '' },
          version: { type: String, default: '1.0.0' },
          available: { type: Boolean, default: false },
        },
        ios: {
          url: { type: String, default: '' },
          version: { type: String, default: '1.0.0' },
          available: { type: Boolean, default: false },
        },
      },
    },

    // ── Feature Toggles ────────────────────────────
    features: {
      vpn: { type: Boolean, default: true },
      firewall: { type: Boolean, default: true },
      realtimeProtection: { type: Boolean, default: true },
      twoFactorAuth: { type: Boolean, default: false },
    },

    // ── AI Settings ────────────────────────────────
    ai: {
      masterToggle: { type: Boolean, default: false },
      name: { type: String, default: 'NexGuard AI' },
      defaultGreeting: { type: String, default: 'Hello! I am NexGuard AI. How can I help you secure your system today?' },
      baseUrl: { type: String, default: 'https://hdmaiserver.pxxl.click' },
      apiKey: String,
      model: { type: String, default: 'vault' },
      rateLimitPerMinute: { type: Number, default: 10 },
      color: { type: String, default: '#00c48c' },
      toggles: {
        landingPage: { type: Boolean, default: false },
        clientDashboard: { type: Boolean, default: false },
        fileUploadAnalysis: { type: Boolean, default: false },
      },
    },

    // ── Email Settings ──────────────────────────────
    email: {
      baseUrl: { type: String, default: 'https://hdmbridgeserver.pxxl.click/api' },
      apiKey: String,
      senderName: { type: String, default: 'NexGuard' },
      senderEmail: { type: String, default: 'noreply@nexguard.io' },
      toggles: {
        welcomeEmail: { type: Boolean, default: true },
        verifyEmail: { type: Boolean, default: true },
        passwordReset: { type: Boolean, default: true },
        passwordChanged: { type: Boolean, default: true },
        newDeviceLogin: { type: Boolean, default: true },
        accountLocked: { type: Boolean, default: true },
        accountDeleted: { type: Boolean, default: true },
        accountSuspended: { type: Boolean, default: true },
        accountReactivated: { type: Boolean, default: true },
        accountDeactivated: { type: Boolean, default: true },
        trialRegistration: { type: Boolean, default: true },
        trialExpiring: { type: Boolean, default: true },
        trialExpired: { type: Boolean, default: true },
        paymentReceived: { type: Boolean, default: true },
        paymentApproved: { type: Boolean, default: true },
        vpnConnected: { type: Boolean, default: true },
        backupCompleted: { type: Boolean, default: true },
        systemHealthAlert: { type: Boolean, default: true },
        criticalThreatAlert: { type: Boolean, default: true },
        newUserRegistration: { type: Boolean, default: true },
        paymentPendingApproval: { type: Boolean, default: true },
      },
    },

    // ── Auto Backup ────────────────────────────────
    autoBackup: { type: Boolean, default: false },
    backupFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    backupSendToEmail: { type: Boolean, default: false },
    backupEmailRecipients: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);