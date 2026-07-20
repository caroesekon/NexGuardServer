const express = require('express');
const router = express.Router();
const vaultController = require('../../controllers/client/vaultController');
const { authenticate } = require('../../middleware/client/authenticate');

router.use(authenticate);

router.get('/', vaultController.getVaultItems);
router.get('/:id', vaultController.getVaultItem);
router.post('/:id/restore', vaultController.restoreFile);
router.delete('/:id', vaultController.deleteFile);

module.exports = router;