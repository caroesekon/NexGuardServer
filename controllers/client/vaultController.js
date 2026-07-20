const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError, paginateQuery, sendPaginated } = require('../../utils/helpers');
const VaultItem = require('../../models/client/VaultItem');

const getVaultItems = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = paginateQuery(req.query);
  const filter = { user: req.user._id, restored: false };

  const [items, total] = await Promise.all([
    VaultItem.find(filter).sort(sort).skip(skip).limit(limit),
    VaultItem.countDocuments(filter),
  ]);
  sendPaginated(res, items, { page, limit, total, pages: Math.ceil(total / limit) });
});

const getVaultItem = asyncHandler(async (req, res) => {
  const item = await VaultItem.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) return sendError(res, 'Item not found', 404);
  sendSuccess(res, item);
});

const restoreFile = asyncHandler(async (req, res) => {
  const item = await VaultItem.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { restored: true, restoredAt: new Date() },
    { new: true }
  );
  if (!item) return sendError(res, 'Item not found', 404);
  console.log(`  \x1b[32m✅ File restored from vault: ${item.originalName}\x1b[0m`);
  sendSuccess(res, item);
});

const deleteFile = asyncHandler(async (req, res) => {
  await VaultItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  sendSuccess(res, { message: 'File permanently deleted' });
});

module.exports = { getVaultItems, getVaultItem, restoreFile, deleteFile };