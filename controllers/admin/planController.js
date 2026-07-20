const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const Plan = require('../../models/admin/Plan');
const logger = require('../../utils/logger');

const getPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find().sort('sortOrder');
  sendSuccess(res, plans);
});

const createPlan = asyncHandler(async (req, res) => {
  const plan = await Plan.create(req.body);
  logger.info(`Admin ${req.admin.email} created plan: ${plan.name}`);
  console.log(`  ${'\x1b[32m'}✅ Plan created: ${plan.name} ($${plan.price})${'\x1b[0m'}`);
  sendSuccess(res, plan, 201);
});

const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) return sendError(res, 'Plan not found', 404);

  Object.assign(plan, req.body);
  await plan.save();

  console.log(`  ${'\x1b[32m'}✅ Plan updated: ${plan.name}${'\x1b[0m'}`);
  sendSuccess(res, plan);
});

const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) return sendError(res, 'Plan not found', 404);

  await plan.deleteOne();
  console.log(`  ${'\x1b[31m'}🗑 Plan deleted: ${plan.name}${'\x1b[0m'}`);
  sendSuccess(res, { message: 'Plan deleted' });
});

module.exports = { getPlans, createPlan, updatePlan, deletePlan };