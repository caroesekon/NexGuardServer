const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    deviceName: String,
    deviceType: String,
    browser: String,
    os: String,
    ip: String,
    location: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

userSessionSchema.index({ user: 1 });
userSessionSchema.index({ refreshToken: 1 });

module.exports = mongoose.model('UserSession', userSessionSchema);