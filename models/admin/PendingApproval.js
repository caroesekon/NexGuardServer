const mongoose = require('mongoose');

const pendingApprovalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    plan: {
      type: String,
      required: true,
    },
    billing: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    proofOfPayment: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    reviewedAt: Date,
    rejectionReason: String,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('PendingApproval', pendingApprovalSchema);