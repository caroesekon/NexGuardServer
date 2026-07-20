const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },
    deviceName: {
      type: String,
      required: true,
    },
    os: String,
    osVersion: String,
    agentVersion: String,
    ip: String,
    lastSeen: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'idle'],
      default: 'offline',
    },
  },
  { timestamps: true }
);

deviceSchema.index({ user: 1 });

module.exports = mongoose.model('Device', deviceSchema);