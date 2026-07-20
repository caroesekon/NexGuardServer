const mongoose = require('mongoose');

const vpnSessionSchema = new mongoose.Schema(
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
    gatewayId: String,
    gatewayName: String,
    region: String,
    assignedIp: String,
    connectedAt: Date,
    disconnectedAt: Date,
    bytesUp: {
      type: Number,
      default: 0,
    },
    bytesDown: {
      type: Number,
      default: 0,
    },
    killSwitchEnabled: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected'],
      default: 'connected',
    },
  },
  { timestamps: true }
);

vpnSessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('VpnSession', vpnSessionSchema);