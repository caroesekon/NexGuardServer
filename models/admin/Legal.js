const mongoose = require('mongoose');

const legalSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['tos', 'privacy', 'gdpr', 'refund', 'acceptable_use'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Legal', legalSchema);