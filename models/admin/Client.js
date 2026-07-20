const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deactivated', 'deleted'],
      default: 'active',
    },
    plan: {
      type: String,
      default: 'Free',
    },
    trialStart: Date,
    trialEnd: Date,
    devicesCount: {
      type: Number,
      default: 0,
    },
    alertsCount: {
      type: Number,
      default: 0,
    },
    lastScan: Date,
    lastActive: Date,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);