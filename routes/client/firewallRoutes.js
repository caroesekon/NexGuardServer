const express = require('express');
const router = express.Router();
const firewallController = require('../../controllers/client/firewallController');
const { authenticate } = require('../../middleware/client/authenticate');

router.use(authenticate);

router.get('/', firewallController.getRules);
router.post('/', firewallController.createRule);
router.patch('/:id', firewallController.updateRule);
router.patch('/:id/toggle', firewallController.toggleRule);
router.delete('/:id', firewallController.deleteRule);

module.exports = router;