const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError, paginateQuery, sendPaginated } = require('../../utils/helpers');
const Scan = require('../../models/client/Scan');
const Alert = require('../../models/client/Alert');
const apiClient = require('../../services/apiClient');

const uploadAndScan = asyncHandler(async (req, res) => {
  const { file_content, file_name } = req.body;

  const result = await apiClient.scanFile({
    fileContent: Buffer.from(file_content, 'base64'),
    fileName: file_name,
    filePath: file_name,
  });

  const scan = await Scan.create({
    user: req.user._id,
    scanType: 'file',
    status: 'completed',
    filesScanned: 1,
    threatsFound: result.threatDetected ? 1 : 0,
    threatNames: result.threatDetected ? [result.threat?.threatName || 'Unknown'] : [],
    bytesScanned: file_content.length,
    fileName: file_name,
    completedAt: new Date(),
  });

  if (result.threatDetected) {
    await Alert.create({
      user: req.user._id,
      scan: scan._id,
      threatName: result.threat?.threatName || 'Unknown',
      threatType: result.threat?.threatType || 'unknown',
      severity: 'high',
      confidence: result.threat?.confidence || 0.9,
      detectionMethod: result.threat?.detectionMethod,
      fileName: file_name,
    });
  }

  sendSuccess(res, { scan, result });
});

const getScanHistory = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = paginateQuery(req.query);
  const [scans, total] = await Promise.all([
    Scan.find({ user: req.user._id }).sort(sort).skip(skip).limit(limit),
    Scan.countDocuments({ user: req.user._id }),
  ]);
  sendPaginated(res, scans, { page, limit, total, pages: Math.ceil(total / limit) });
});

const getScanDetails = asyncHandler(async (req, res) => {
  const scan = await Scan.findOne({ _id: req.params.id, user: req.user._id });
  if (!scan) return sendError(res, 'Scan not found', 404);
  sendSuccess(res, scan);
});

module.exports = { uploadAndScan, getScanHistory, getScanDetails };