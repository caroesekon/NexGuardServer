const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError, paginateQuery, sendPaginated } = require('../../utils/helpers');
const Alert = require('../../models/client/Alert');

const getAlerts = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = paginateQuery(req.query);
  const filter = { user: req.user._id };

  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.isRead) filter.isRead = req.query.isRead === 'true';

  const [alerts, total] = await Promise.all([
    Alert.find(filter).sort(sort).skip(skip).limit(limit),
    Alert.countDocuments(filter),
  ]);
  sendPaginated(res, alerts, { page, limit, total, pages: Math.ceil(total / limit) });
});

const getAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findOne({ _id: req.params.id, user: req.user._id });
  if (!alert) return sendError(res, 'Alert not found', 404);
  sendSuccess(res, alert);
});

const markAsRead = asyncHandler(async (req, res) => {
  const alert = await Alert.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!alert) return sendError(res, 'Alert not found', 404);
  sendSuccess(res, alert);
});

const markAllRead = asyncHandler(async (req, res) => {
  await Alert.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  sendSuccess(res, { message: 'All alerts marked as read' });
});

const getAlertStats = asyncHandler(async (req, res) => {
  const [total, critical, high, medium, low, unread] = await Promise.all([
    Alert.countDocuments({ user: req.user._id }),
    Alert.countDocuments({ user: req.user._id, severity: 'critical' }),
    Alert.countDocuments({ user: req.user._id, severity: 'high' }),
    Alert.countDocuments({ user: req.user._id, severity: 'medium' }),
    Alert.countDocuments({ user: req.user._id, severity: 'low' }),
    Alert.countDocuments({ user: req.user._id, isRead: false }),
  ]);
  sendSuccess(res, { total, critical, high, medium, low, unread });
});

module.exports = { getAlerts, getAlert, markAsRead, markAllRead, getAlertStats };