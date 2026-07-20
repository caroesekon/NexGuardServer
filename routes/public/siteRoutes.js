const express = require('express');
const router = express.Router();
const siteController = require('../../controllers/public/siteController');

router.get('/info', siteController.getSiteInfo);
router.get('/legal', siteController.getLegalLinks);
router.get('/payment-methods', siteController.getActivePaymentMethods);

module.exports = router;