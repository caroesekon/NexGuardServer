const express = require('express');
const router = express.Router();
const licenseController = require('../../controllers/admin/licenseController');
const { authenticateAdmin } = require('../../middleware/admin/authenticateAdmin');

router.use(authenticateAdmin);

router.get('/', licenseController.getLicenses);
router.get('/:id', licenseController.getLicense);
router.post('/generate', licenseController.generateLicense);
router.patch('/:id/revoke', licenseController.revokeLicense);
router.delete('/:id', licenseController.deleteLicense);

module.exports = router;