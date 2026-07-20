const express = require('express');
const router = express.Router();
const backupController = require('../../controllers/admin/backupController');
const { authenticateAdmin } = require('../../middleware/admin/authenticateAdmin');

router.use(authenticateAdmin);

router.get('/', backupController.getBackups);
router.get('/settings', backupController.getAutoBackupSettings);
router.patch('/settings', backupController.updateAutoBackupSettings);
router.post('/create', backupController.createNow);
router.post('/upload', backupController.uploadBackup);
router.get('/:id', backupController.getBackup);
router.post('/:id/restore', backupController.restoreBackup);
router.get('/:id/download', backupController.downloadBackup);
router.post('/:id/send-email', backupController.sendToEmail);
router.delete('/:id', backupController.deleteBackup);

module.exports = router;