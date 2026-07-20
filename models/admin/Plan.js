const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['Free Trial', 'Pro', 'Enterprise'],
    },
    pricing: {
      monthly: { type: Number, default: 0 },
      yearly: { type: Number, default: 0 },
      oneTime: { type: Number, default: 0 },
    },
    currency: { type: String, default: 'USD' },
    trialDays: { type: Number, default: 30 },
    deviceLimit: { type: Number, default: 1 },
    scansPerDay: { type: Number, default: 5 },
    vpnIncluded: { type: Boolean, default: false },
    bandwidthLimitGB: { type: Number, default: 0 },
    features: [String],
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);