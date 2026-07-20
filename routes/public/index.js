const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const paymentRoutes = require('./paymentRoutes');
const planRoutes = require('./planRoutes');
const siteRoutes = require('./siteRoutes');
const apiRoutes = require('./apiRoutes');
const bootstrapRoutes = require('./bootstrapRoutes');
const chatRoutes = require('./chatRoutes');
const regRoutes = require('./regRoutes');
const renewalRoutes = require('./renewalRoutes');
const licenseRoutes = require('./licenseRoutes');

router.use('/auth', authRoutes);
router.use('/payments', paymentRoutes);
router.use('/plans', planRoutes);
router.use('/site', siteRoutes);
router.use('/api', apiRoutes);
router.use('/v1', bootstrapRoutes);
router.use('/chat', chatRoutes);
router.use('/auth', regRoutes);
router.use('/renewal', renewalRoutes);
router.use('/v1/license', licenseRoutes);

module.exports = router;