const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const aiService = require('../../services/aiService');
const Setting = require('../../models/admin/Setting');

const publicChat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) return sendError(res, 'Message is required', 400);

  const settings = await Setting.findOne();
  const result = await aiService.publicChat(message, {
    supportEmail: settings?.supportEmail,
    supportPhone: settings?.supportPhone,
  });

  sendSuccess(res, result);
});

const getPublicConfig = asyncHandler(async (req, res) => {
  const config = await aiService.getPublicConfig();
  sendSuccess(res, config);
});

module.exports = { publicChat, getPublicConfig };