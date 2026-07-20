const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    location: String,
    publicId: String,
    type: { type: String, enum: ['manual', 'auto'], default: 'manual' },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'manual'], default: 'manual' },
    status: { type: String, enum: ['completed', 'failed', 'restored', 'in_progress'], default: 'completed' },
    sendToEmail: { type: Boolean, default: false },
    emailRecipients: [String],
    error: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    completedAt: Date,
    collections: [String],
    databaseSize: Number,
    compressionRatio: Number,
  },
  { timestamps: true }
);

backupSchema.index({ type: 1, createdAt: -1 });
backupSchema.index({ status: 1 });

module.exports = mongoose.model('Backup', backupSchema);