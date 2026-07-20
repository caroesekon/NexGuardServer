const express = require('express');
const router = express.Router();
const settingController = require('../../controllers/admin/settingController');
const { authenticateAdmin } = require('../../middleware/admin/authenticateAdmin');

router.use(authenticateAdmin);

router.get('/', settingController.getSettings);
router.patch('/', settingController.updateSettings);
router.patch('/ai', settingController.updateAiSettings);
router.patch('/email', settingController.updateEmailSettings);
router.get('/toggles', settingController.getFeatureToggles);

module.exports = router;