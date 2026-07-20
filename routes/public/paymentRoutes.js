const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/public/paymentController');

router.post('/activate-free', paymentController.activateFree);
router.post('/create-checkout', paymentController.createCheckoutSession);
router.post('/stripe-webhook', paymentController.handleStripeWebhook);
router.post('/paypal-webhook', paymentController.handlePayPalWebhook);
router.post('/mpesa-callback', paymentController.handleMpesaCallback);
router.get('/success', paymentController.paymentSuccess);
router.get('/cancel', paymentController.paymentCancel);

module.exports = router;