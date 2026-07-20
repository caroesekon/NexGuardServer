const express = require('express');
const router = express.Router();
const alertController = require('../../controllers/client/alertController');
const { authenticate } = require('../../middleware/client/authenticate');

router.use(authenticate);

router.get('/', alertController.getAlerts);
router.get('/stats', alertController.getAlertStats);
router.get('/:id', alertController.getAlert);
router.patch('/:id/read', alertController.markAsRead);
router.patch('/read-all', alertController.markAllRead);

module.exports = router;