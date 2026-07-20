const express = require('express');
const router = express.Router();
const clientController = require('../../controllers/admin/clientController');
const { authenticateAdmin } = require('../../middleware/admin/authenticateAdmin');

router.use(authenticateAdmin);

router.get('/', clientController.getClients);
router.get('/:id', clientController.getClient);
router.patch('/:id/suspend', clientController.suspendClient);
router.patch('/:id/reactivate', clientController.reactivateClient);
router.delete('/:id', clientController.deleteClient);

module.exports = router;