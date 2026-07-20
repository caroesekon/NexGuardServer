const express = require('express');
const router = express.Router();
const apiController = require('../../controllers/public/apiController');

router.post('/engine/bootstrap', apiController.bootstrapEngine);
router.post('/engine/update-rules', apiController.updateRules);
router.get('/engine/health', apiController.healthCheck);

module.exports = router;