const express = require('express');
const router = express.Router();
const paymentMethodController = require('../../controllers/admin/paymentMethodController');
const { authenticateAdmin } = require('../../middleware/admin/authenticateAdmin');

router.use(authenticateAdmin);

router.get('/', paymentMethodController.getPaymentMethods);
router.patch('/:id', paymentMethodController.updatePaymentMethod);
router.patch('/:id/toggle', paymentMethodController.toggleActive);

module.exports = router;