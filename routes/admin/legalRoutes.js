const express = require('express');
const router = express.Router();
const legalController = require('../../controllers/admin/legalController');
const { authenticateAdmin } = require('../../middleware/admin/authenticateAdmin');

router.use(authenticateAdmin);

router.get('/', legalController.getLegalDocs);
router.post('/', legalController.createLegalDoc);
router.patch('/:id', legalController.updateLegalDoc);
router.patch('/:id/publish', legalController.publishLegalDoc);
router.delete('/:id', legalController.deleteLegalDoc);

module.exports = router;