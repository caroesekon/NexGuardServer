const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/helpers');
const Legal = require('../../models/admin/Legal');
const logger = require('../../utils/logger');

const getLegalDocs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.published) filter.isPublished = req.query.published === 'true';

  const docs = await Legal.find(filter).sort('-version');
  sendSuccess(res, docs);
});

const createLegalDoc = asyncHandler(async (req, res) => {
  const doc = await Legal.create({ ...req.body, updatedBy: req.admin._id });
  logger.info(`Admin ${req.admin.email} created legal doc: ${doc.title}`);
  console.log(`  ${'\x1b[32m'}✅ Legal doc created: ${doc.title} v${doc.version}${'\x1b[0m'}`);
  sendSuccess(res, doc, 201);
});

const updateLegalDoc = asyncHandler(async (req, res) => {
  const doc = await Legal.findById(req.params.id);
  if (!doc) return sendError(res, 'Document not found', 404);

  Object.assign(doc, req.body);
  doc.updatedBy = req.admin._id;
  await doc.save();

  console.log(`  ${'\x1b[32m'}✅ Legal doc updated: ${doc.title}${'\x1b[0m'}`);
  sendSuccess(res, doc);
});

const publishLegalDoc = asyncHandler(async (req, res) => {
  const doc = await Legal.findById(req.params.id);
  if (!doc) return sendError(res, 'Document not found', 404);

  doc.isPublished = true;
  doc.publishedAt = new Date();
  await doc.save();

  console.log(`  ${'\x1b[32m'}✅ Legal doc published: ${doc.title}${'\x1b[0m'}`);
  sendSuccess(res, doc);
});

const deleteLegalDoc = asyncHandler(async (req, res) => {
  const doc = await Legal.findById(req.params.id);
  if (!doc) return sendError(res, 'Document not found', 404);

  await doc.deleteOne();
  console.log(`  ${'\x1b[31m'}🗑 Legal doc deleted: ${doc.title}${'\x1b[0m'}`);
  sendSuccess(res, { message: 'Document deleted' });
});

module.exports = { getLegalDocs, createLegalDoc, updateLegalDoc, publishLegalDoc, deleteLegalDoc };