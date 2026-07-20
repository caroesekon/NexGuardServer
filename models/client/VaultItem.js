const mongoose = require('mongoose');

const vaultItemSchema = new mongoose.Schema(
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
    originalPath: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    threatName: String,
    threatType: String,
    fileSize: Number,
    fileHash: String,
    encryptedPath: String,
    encrypted: {
      type: Boolean,
      default: false,
    },
    restored: {
      type: Boolean,
      default: false,
    },
    restoredAt: Date,
    notes: String,
  },
  { timestamps: true }
);

vaultItemSchema.index({ user: 1 });
vaultItemSchema.index({ restored: 1 });

module.exports = mongoose.model('VaultItem', vaultItemSchema);