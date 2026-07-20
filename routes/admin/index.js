const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const clientRoutes = require('./clientRoutes');
const pendingApprovalRoutes = require('./pendingApprovalRoutes');
const paymentRoutes = require('./paymentRoutes');
const paymentMethodRoutes = require('./paymentMethodRoutes');
const planRoutes = require('./planRoutes');
const settingRoutes = require('./settingRoutes');
const auditLogRoutes = require('./auditLogRoutes');
const backupRoutes = require('./backupRoutes');
const legalRoutes = require('./legalRoutes');
const adminRoutes = require('./adminRoutes');
const healthRoutes = require('./healthRoutes');
const licenseRoutes = require('./licenseRoutes');


router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/clients', clientRoutes);
router.use('/approvals', pendingApprovalRoutes);
router.use('/payments', paymentRoutes);
router.use('/payment-methods', paymentMethodRoutes);
router.use('/plans', planRoutes);
router.use('/settings', settingRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/backups', backupRoutes);
router.use('/legal', legalRoutes);
router.use('/admins', adminRoutes);
router.use('/health', healthRoutes);
router.use('/licenses', licenseRoutes);

module.exports = router;