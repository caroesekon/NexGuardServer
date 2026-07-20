const express = require('express');
const router = express.Router();
const renewalController = require('../../controllers/public/renewalController');

router.post('/renew', renewalController.renewSubscription);

module.exports = router;