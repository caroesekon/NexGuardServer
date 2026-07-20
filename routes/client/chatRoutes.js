const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/client/chatController');
const { authenticate } = require('../../middleware/client/authenticate');

router.use(authenticate);

router.post('/', chatController.clientChat);
router.post('/analyze-file', chatController.analyzeFile);

module.exports = router;