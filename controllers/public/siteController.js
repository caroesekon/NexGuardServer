const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/helpers');
const Setting = require('../../models/admin/Setting');
const Legal = require('../../models/admin/Legal');
const PaymentMethod = require('../../models/admin/PaymentMethod');

const getSiteInfo = asyncHandler(async (req, res) => {
  const settings = await Setting.findOne();
  sendSuccess(res, {
    name: settings?.appName || 'NexGuard',
    logo: settings?.logo,
    supportEmail: settings?.supportEmail,
    supportPhone: settings?.supportPhone,
    currency: settings?.currency || 'USD',
    features: settings?.features,
    downloads: settings?.downloads || {
      desktop: {
        windows: { url: '', version: '1.0.0', available: true },
        macos: { url: '', version: '1.0.0', available: true },
        linux: { url: '', version: '1.0.0', available: true },
      },
      mobile: {
        android: { url: '', version: '1.0.0', available: false },
        ios: { url: '', version: '1.0.0', available: false },
      },
    },
    ai: {
      masterToggle: settings?.ai?.masterToggle ?? false,
      name: settings?.ai?.name || 'NexGuard AI',
      color: settings?.ai?.color || '#00c48c',
      toggles: {
        landingPage: settings?.ai?.toggles?.landingPage ?? false,
        clientDashboard: settings?.ai?.toggles?.clientDashboard ?? false,
        fileUploadAnalysis: settings?.ai?.toggles?.fileUploadAnalysis ?? false,
      },
    },
  });
});

const getLegalLinks = asyncHandler(async (req, res) => {
  const docs = await Legal.find({ isPublished: true }).select('type title version publishedAt');
  sendSuccess(res, docs);
});

const getActivePaymentMethods = asyncHandler(async (req, res) => {
  const methods = await PaymentMethod.find({ isActive: true }).select('name type displayName logo supportedCurrencies config requireProof');
  sendSuccess(res, methods);
});

module.exports = { getSiteInfo, getLegalLinks, getActivePaymentMethods };