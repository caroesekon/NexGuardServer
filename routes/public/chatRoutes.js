const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/public/chatController');

router.post('/', chatController.publicChat);
router.get('/config', chatController.getPublicConfig);

module.exports = router;