const express = require('express');
const router = express.Router();
const regController = require('../../controllers/public/regController');
const { validate } = require('../../middleware/client/validateRequest');
const { registerSchema } = require('../../utils/validators');
const { authLimiter } = require('../../middleware/global/rateLimiter');

router.use(authLimiter);

router.post('/register', validate(registerSchema), regController.register);

module.exports = router;