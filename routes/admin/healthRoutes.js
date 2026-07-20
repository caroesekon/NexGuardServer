const express = require('express');
const router = express.Router();
const healthController = require('../../controllers/admin/healthController');
const { authenticateAdmin } = require('../../middleware/admin/authenticateAdmin');

router.use(authenticateAdmin);
router.get('/', healthController.getHealth);

module.exports = router;