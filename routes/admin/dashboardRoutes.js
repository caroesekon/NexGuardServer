const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboardController');
const { authenticateAdmin } = require('../../middleware/admin/authenticateAdmin');

router.use(authenticateAdmin);

router.get('/overview', dashboardController.getOverview);
router.get('/stats', dashboardController.getStats);
router.get('/active-agents', dashboardController.getActiveAgents);
router.get('/threat-map', dashboardController.getThreatMap);

module.exports = router;