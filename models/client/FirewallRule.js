const mongoose = require('mongoose');

const firewallRuleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
    },
    ruleId: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['allow', 'block', 'log_only'],
      required: true,
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound', 'both'],
      default: 'both',
    },
    protocol: String,
    remoteIp: String,
    remotePort: Number,
    localPort: String,
    application: String,
    enabled: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    hitCount: {
      type: Number,
      default: 0,
    },
    lastHit: Date,
  },
  { timestamps: true }
);

firewallRuleSchema.index({ user: 1, device: 1 });
firewallRuleSchema.index({ ruleId: 1 });

module.exports = mongoose.model('FirewallRule', firewallRuleSchema);