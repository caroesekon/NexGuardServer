const express = require('express');
const router = express.Router();
const auditLogController = require('../../controllers/admin/auditLogController');
const { authenticateAdmin } = require('../../middleware/admin/authenticateAdmin');

router.use(authenticateAdmin);

router.get('/', auditLogController.getAuditLogs);
router.get('/:id', auditLogController.getAuditLog);

module.exports = router;