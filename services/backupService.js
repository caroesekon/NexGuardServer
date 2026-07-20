const path = require('path');
const fs = require('fs');
const { uploadFile } = require('./cloudinaryService');
const Backup = require('../models/admin/Backup');

const createBackup = async (adminId) => {
  const mongoose = require('mongoose');
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  const backupData = {};

  for (const col of collections) {
    const docs = await db.collection(col.name).find({}).toArray();
    backupData[col.name] = docs;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `nexguard-backup-${timestamp}.json`;
  const filepath = path.join(__dirname, '..', 'backups', filename);

  // Ensure backups directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write JSON
  fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

  const stats = fs.statSync(filepath);

  // Upload to Cloudinary
  const upload = await uploadFile(filepath, 'nexguard-backups');

  // Create backup record
  const backup = await Backup.create({
    filename,
    size: stats.size,
    location: upload.url,
    publicId: upload.publicId,
    type: 'manual',
    frequency: 'manual',
    status: 'completed',
    completedAt: new Date(),
    createdBy: adminId,
  });

  // Clean up local file
  fs.unlinkSync(filepath);

  return backup;
};

const restoreBackup = async (backupId) => {
  const backup = await Backup.findById(backupId);
  if (!backup) throw new Error('Backup not found');

  // Fetch the backup JSON from Cloudinary
  const axios = require('axios');
  const response = await axios.get(backup.location);
  const data = response.data;

  const mongoose = require('mongoose');
  const db = mongoose.connection.db;

  // Drop all existing collections
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.collection(col.name).drop().catch(() => {});
  }

  // Restore each collection
  for (const [name, docs] of Object.entries(data)) {
    if (docs.length > 0) {
      await db.collection(name).insertMany(docs);
    }
  }

  return backup;
};

module.exports = { createBackup, restoreBackup };