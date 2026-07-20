const express = require('express');
const router = express.Router();
const apiController = require('../../controllers/public/apiController');
const { apiLimiter } = require('../../middleware/global/rateLimiter');

router.use(apiLimiter);

router.post('/scan/file', apiController.scanFile);
router.post('/scan/hash', apiController.matchHash);
router.post('/scan/yara', apiController.runYara);
router.post('/scan/process', apiController.analyzeProcess);
router.post('/firewall/evaluate', apiController.evaluateConnection);
router.post('/firewall/compile', apiController.compileFirewallRules);
router.post('/vpn/keypair', apiController.generateVpnKeypair);
router.post('/vpn/client-config', apiController.generateVpnClientConfig);
router.post('/vpn/gateway-config', apiController.generateVpnGatewayConfig);
router.post('/engine/bootstrap', apiController.bootstrapEngine);
router.post('/engine/update-rules', apiController.updateRules);
router.get('/engine/health', apiController.healthCheck);

module.exports = router;