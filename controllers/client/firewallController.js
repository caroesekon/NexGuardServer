const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const FirewallRule = require('../../models/client/FirewallRule');

const getRules = asyncHandler(async (req, res) => {
  const rules = await FirewallRule.find({ user: req.user._id }).sort('priority');
  sendSuccess(res, rules);
});

const createRule = asyncHandler(async (req, res) => {
  const rule = await FirewallRule.create({
    ...req.body,
    user: req.user._id,
    ruleId: require('uuid').v4(),
  });
  console.log(`  \x1b[32m✅ Firewall rule created: ${rule.ruleId}\x1b[0m`);
  sendSuccess(res, rule, 201);
});

const updateRule = asyncHandler(async (req, res) => {
  const rule = await FirewallRule.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!rule) return sendError(res, 'Rule not found', 404);
  sendSuccess(res, rule);
});

const deleteRule = asyncHandler(async (req, res) => {
  await FirewallRule.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  sendSuccess(res, { message: 'Rule deleted' });
});

const toggleRule = asyncHandler(async (req, res) => {
  const rule = await FirewallRule.findOne({ _id: req.params.id, user: req.user._id });
  if (!rule) return sendError(res, 'Rule not found', 404);
  rule.enabled = !rule.enabled;
  await rule.save();
  sendSuccess(res, rule);
});

module.exports = { getRules, createRule, updateRule, deleteRule, toggleRule };