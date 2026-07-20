const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const PaymentMethod = require('../../models/admin/PaymentMethod');
const logger = require('../../utils/logger');

const getPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await PaymentMethod.find();
  sendSuccess(res, methods);
});

const updatePaymentMethod = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findById(req.params.id);
  if (!method) return sendError(res, 'Payment method not found', 404);

  Object.assign(method, req.body);
  await method.save();

  logger.info(`Admin ${req.admin.email} updated payment method: ${method.name}`);
  console.log(`  ${'\x1b[32m'}✅ Payment method updated: ${method.name}${'\x1b[0m'}`);

  sendSuccess(res, method);
});

const toggleActive = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findById(req.params.id);
  if (!method) return sendError(res, 'Payment method not found', 404);

  method.isActive = !method.isActive;
  await method.save();

  const status = method.isActive ? 'activated' : 'deactivated';
  console.log(`  ${'\x1b[33m'}⚠ Payment method ${status}: ${method.name}${'\x1b[0m'}`);

  sendSuccess(res, { message: `Payment method ${status}`, method });
});

module.exports = { getPaymentMethods, updatePaymentMethod, toggleActive };