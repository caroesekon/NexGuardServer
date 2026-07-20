const mongoose = require('mongoose');

const licenseKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'revoked', 'expired'],
      default: 'active',
    },
    deviceLimit: {
      type: Number,
      default: 1,
    },
    devices: [{
      deviceId: String,
      deviceName: String,
      activatedAt: Date,
    }],
    expiresAt: Date,
    activatedAt: Date,
    revokedAt: Date,
    revocationReason: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

licenseKeySchema.index({ user: 1 });
licenseKeySchema.index({ status: 1 });

module.exports = mongoose.model('LicenseKey', licenseKeySchema);