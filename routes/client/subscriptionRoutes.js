const express = require('express');
const router = express.Router();
const subscriptionController = require('../../controllers/client/subscriptionController');
const { authenticate } = require('../../middleware/client/authenticate');

router.get('/plans', subscriptionController.getPlans);

router.use(authenticate);

router.get('/', subscriptionController.getMySubscription);
router.post('/trial', subscriptionController.startTrial);
router.post('/upgrade', subscriptionController.upgradePlan);
router.post('/cancel', subscriptionController.cancelSubscription);
router.get('/billing-history', subscriptionController.getBillingHistory);

module.exports = router;