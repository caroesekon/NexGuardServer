const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
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
    scan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scan',
    },
    threatName: {
      type: String,
      required: true,
    },
    threatType: {
      type: String,
      enum: ['virus', 'trojan', 'worm', 'ransomware', 'spyware', 'adware', 'rootkit', 'pup', 'unknown'],
      default: 'unknown',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    detectionMethod: String,
    filePath: String,
    fileName: String,
    fileHash: String,
    actionTaken: {
      type: String,
      enum: ['quarantined', 'blocked', 'ignored', 'deleted', 'restored'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    details: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

alertSchema.index({ user: 1, createdAt: -1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ isRead: 1 });

module.exports = mongoose.model('Alert', alertSchema);