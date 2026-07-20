const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/admin/paymentController');
const { authenticateAdmin } = require('../../middleware/admin/authenticateAdmin');

router.use(authenticateAdmin);

router.get('/', paymentController.getPayments);
router.get('/:id', paymentController.getPayment);
router.post('/:id/refund', paymentController.refundPayment);

module.exports = router;