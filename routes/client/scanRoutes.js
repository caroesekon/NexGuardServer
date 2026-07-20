const express = require('express');
const router = express.Router();
const scanController = require('../../controllers/client/scanController');
const { authenticate } = require('../../middleware/client/authenticate');

router.use(authenticate);

router.post('/upload', scanController.uploadAndScan);
router.get('/', scanController.getScanHistory);
router.get('/:id', scanController.getScanDetails);

module.exports = router;