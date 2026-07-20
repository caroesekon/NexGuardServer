const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendPaginated, paginateQuery } = require('../../utils/helpers');
const AuditLog = require('../../models/admin/AuditLog');

const getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = paginateQuery(req.query);
  const filter = {};

  if (req.query.admin) filter.admin = req.query.admin;
  if (req.query.action) filter.action = req.query.action;
  if (req.query.startDate) filter.createdAt = { $gte: new Date(req.query.startDate) };
  if (req.query.endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(req.query.endDate) };

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).populate('admin', 'name email').sort(sort).skip(skip).limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  sendPaginated(res, logs, { page, limit, total, pages: Math.ceil(total / limit) });
});

const getAuditLog = asyncHandler(async (req, res) => {
  const log = await AuditLog.findById(req.params.id).populate('admin', 'name email');
  if (!log) return sendError(res, 'Log not found', 404);
  sendSuccess(res, log);
});

module.exports = { getAuditLogs, getAuditLog };