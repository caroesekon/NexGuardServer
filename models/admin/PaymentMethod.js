const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['stripe', 'paypal', 'mpesa_stk_push', 'mpesa_send_money', 'mpesa_paybill', 'mpesa_till'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    requireProof: { type: Boolean, default: false },
    config: {
      publicKey: String,
      secretKey: String,
      webhookSecret: String,
      passkey: String,
      shortcode: String,
      businessNumber: String,
      accountNumber: String,
      phoneNumber: String,
      mode: { type: String, enum: ['sandbox', 'live'], default: 'sandbox' },
    },
    displayName: String,
    logo: String,
    supportedCurrencies: [String],
    instructions: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);