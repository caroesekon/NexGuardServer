const express = require('express');
const router = express.Router();
const planController = require('../../controllers/public/planController');

router.get('/', planController.getPlans);

module.exports = router;