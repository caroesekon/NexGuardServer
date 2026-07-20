const express = require('express');
const router = express.Router();
const pendingApprovalController = require('../../controllers/admin/pendingApprovalController');
const { authenticateAdmin } = require('../../middleware/admin/authenticateAdmin');

router.use(authenticateAdmin);

router.get('/', pendingApprovalController.getPendingApprovals);
router.patch('/:id/approve', pendingApprovalController.approve);
router.patch('/:id/reject', pendingApprovalController.reject);

module.exports = router;