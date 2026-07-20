const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
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
      enum: ['trial', 'active', 'expired', 'cancelled'],
      default: 'trial',
    },
    billing: {
      type: String,
      enum: ['monthly', 'yearly', 'oneTime'],
      default: 'monthly',
    },
    trialStart: Date,
    trialEnd: Date,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    autoRenew: {
      type: Boolean,
      default: false,
    },
    deviceLimit: {
      type: Number,
      default: 1,
    },
    scansPerDay: {
      type: Number,
      default: 5,
    },
    vpnIncluded: {
      type: Boolean,
      default: false,
    },
    bandwidthLimitGB: {
      type: Number,
      default: 0,
    },
    cancelledAt: Date,
    cancelReason: String,
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);