const express = require('express');
const router = express.Router();
const deviceController = require('../../controllers/client/deviceController');
const { authenticate } = require('../../middleware/client/authenticate');

router.use(authenticate);

router.get('/', deviceController.getDevices);
router.get('/:id', deviceController.getDevice);
router.patch('/:id', deviceController.renameDevice);
router.delete('/:id', deviceController.removeDevice);

module.exports = router;