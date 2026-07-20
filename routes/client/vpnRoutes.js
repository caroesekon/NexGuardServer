const express = require('express');
const router = express.Router();
const vpnController = require('../../controllers/client/vpnController');
const { authenticate } = require('../../middleware/client/authenticate');

router.get('/gateways', vpnController.getGateways);

router.use(authenticate);

router.post('/connect', vpnController.connect);
router.post('/disconnect', vpnController.disconnect);
router.get('/status', vpnController.getStatus);
router.get('/bandwidth', vpnController.getBandwidthUsage);

module.exports = router;