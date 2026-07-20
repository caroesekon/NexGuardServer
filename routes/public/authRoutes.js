const express = require('express');
const router = express.Router();
const authController = require('../../controllers/public/authController');
const { authenticate } = require('../../middleware/client/authenticate');
const { validate } = require('../../middleware/client/validateRequest');
const { loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../../utils/validators');
const { authLimiter } = require('../../middleware/global/rateLimiter');

router.use(authLimiter);

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.get('/check-email', authController.checkEmail);

module.exports = router;