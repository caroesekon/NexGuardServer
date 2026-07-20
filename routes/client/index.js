const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const deviceRoutes = require('./deviceRoutes');
const scanRoutes = require('./scanRoutes');
const alertRoutes = require('./alertRoutes');
const firewallRoutes = require('./firewallRoutes');
const vpnRoutes = require('./vpnRoutes');
const vaultRoutes = require('./vaultRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const chatRoutes = require('./chatRoutes');

router.use('/user', userRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/devices', deviceRoutes);
router.use('/scans', scanRoutes);
router.use('/alerts', alertRoutes);
router.use('/firewall', firewallRoutes);
router.use('/vpn', vpnRoutes);
router.use('/vault', vaultRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/chat', chatRoutes);

module.exports = router;