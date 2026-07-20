const express = require('express');
const router = express.Router();
const userController = require('../../controllers/client/userController');
const { authenticate } = require('../../middleware/client/authenticate');

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.patch('/change-password', userController.changePassword);
router.post('/avatar', userController.uploadAvatar);
router.delete('/account', userController.deleteAccount);
router.get('/sessions', userController.getSessions);
router.delete('/sessions/:id', userController.revokeSession);
router.post('/2fa/enable', userController.enable2FA);
router.post('/2fa/verify', userController.verify2FA);
router.post('/2fa/disable', userController.disable2FA);

module.exports = router;