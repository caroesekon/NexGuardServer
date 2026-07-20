const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/helpers');
const Plan = require('../../models/admin/Plan');

const getPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ isActive: true }).sort('sortOrder');
  sendSuccess(res, plans);
});

module.exports = { getPlans };