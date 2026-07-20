const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const Device = require('../../models/client/Device');

const getDevices = asyncHandler(async (req, res) => {
  const devices = await Device.find({ user: req.user._id });
  sendSuccess(res, devices);
});

const getDevice = asyncHandler(async (req, res) => {
  const device = await Device.findOne({ _id: req.params.id, user: req.user._id });
  if (!device) return sendError(res, 'Device not found', 404);
  sendSuccess(res, device);
});

const renameDevice = asyncHandler(async (req, res) => {
  const device = await Device.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { deviceName: req.body.deviceName },
    { new: true }
  );
  if (!device) return sendError(res, 'Device not found', 404);
  sendSuccess(res, device);
});

const removeDevice = asyncHandler(async (req, res) => {
  const device = await Device.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!device) return sendError(res, 'Device not found', 404);
  sendSuccess(res, { message: 'Device removed' });
});

module.exports = { getDevices, getDevice, renameDevice, removeDevice };