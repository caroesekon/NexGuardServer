const express = require('express');
const router = express.Router();
const authController = require('../../controllers/admin/authController');
const { validate } = require('../../middleware/client/validateRequest');
const { loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../../utils/validators');
const { authLimiter } = require('../../middleware/global/rateLimiter');

router.use(authLimiter);

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;