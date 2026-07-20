const express = require('express');
const router = express.Router();
const licenseController = require('../../controllers/public/licenseController');

router.post('/check', licenseController.checkLicense);

module.exports = router;