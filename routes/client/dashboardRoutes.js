const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/client/dashboardController');
const { authenticate } = require('../../middleware/client/authenticate');
const { checkSubscription } = require('../../middleware/client/checkSubscription');

router.use(authenticate);
router.use(checkSubscription);  // ← Add this

router.get('/overview', dashboardController.getOverview);
router.get('/protection-status', dashboardController.getProtectionStatus);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;