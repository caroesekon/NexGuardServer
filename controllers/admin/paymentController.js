const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendPaginated, paginateQuery } = require('../../utils/helpers');
const Payment = require('../../models/admin/Payment');
const logger = require('../../utils/logger');

const getPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = paginateQuery(req.query);
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.method) filter.method = req.query.method;

  const [payments, total] = await Promise.all([
    Payment.find(filter).populate('user', 'name email').sort(sort).skip(skip).limit(limit),
    Payment.countDocuments(filter),
  ]);

  sendPaginated(res, payments, { page, limit, total, pages: Math.ceil(total / limit) });
});

const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('user', 'name email');
  if (!payment) return sendError(res, 'Payment not found', 404);
  sendSuccess(res, payment);
});

const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return sendError(res, 'Payment not found', 404);

  payment.status = 'refunded';
  payment.refundAmount = req.body.amount || payment.amount;
  payment.refundReason = req.body.reason;
  payment.refundedAt = new Date();
  await payment.save();

  logger.info(`Admin ${req.admin.email} refunded payment: ${payment._id}`);
  console.log(`  ${'\x1b[33m'}💰 Payment refunded: $${payment.refundAmount}${'\x1b[0m'}`);

  sendSuccess(res, { message: 'Payment refunded', payment });
});

module.exports = { getPayments, getPayment, refundPayment };