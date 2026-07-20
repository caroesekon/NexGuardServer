const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');
const { authenticateAdmin } = require('../../middleware/admin/authenticateAdmin');
const { checkPermission } = require('../../middleware/admin/checkPermission');

router.use(authenticateAdmin);
router.use(checkPermission('super_admin'));

router.get('/', adminController.getAdmins);
router.post('/', adminController.createAdmin);
router.patch('/:id', adminController.updateAdminRole);
router.delete('/:id', adminController.removeAdmin);

module.exports = router;