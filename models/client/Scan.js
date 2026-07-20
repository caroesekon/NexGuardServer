const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema(
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
    scanType: {
      type: String,
      enum: ['file', 'quick', 'full', 'custom', 'process'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    filesScanned: {
      type: Number,
      default: 0,
    },
    threatsFound: {
      type: Number,
      default: 0,
    },
    threatNames: [String],
    duration: Number,
    bytesScanned: Number,
    filePath: String,
    fileName: String,
    error: String,
    completedAt: Date,
  },
  { timestamps: true }
);

scanSchema.index({ user: 1, createdAt: -1 });
scanSchema.index({ device: 1 });

module.exports = mongoose.model('Scan', scanSchema);