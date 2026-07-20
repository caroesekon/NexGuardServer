const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/helpers');
const Setting = require('../../models/admin/Setting');
const logger = require('../../utils/logger');

const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }
  sendSuccess(res, settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create(req.body);
  } else {
    // Deep merge nested objects
    if (req.body.features) {
      settings.features = { ...settings.features.toObject(), ...req.body.features };
      delete req.body.features;
    }
    if (req.body.ai) {
      if (req.body.ai.toggles) {
        req.body.ai.toggles = { ...settings.ai?.toggles?.toObject(), ...req.body.ai.toggles };
      }
      settings.ai = { ...settings.ai?.toObject(), ...req.body.ai };
      delete req.body.ai;
    }
    if (req.body.email) {
      if (req.body.email.toggles) {
        req.body.email.toggles = { ...settings.email?.toggles?.toObject(), ...req.body.email.toggles };
      }
      settings.email = { ...settings.email?.toObject(), ...req.body.email };
      delete req.body.email;
    }

    Object.assign(settings, req.body);
    settings.updatedBy = req.admin._id;
    await settings.save();
  }

  logger.info(`Admin ${req.admin.email} updated system settings`);
  console.log(`  \x1b[32m✅ Settings updated\x1b[0m`);

  sendSuccess(res, settings);
});

// ── Specific AI Settings ─────────────────────────────
const updateAiSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({});

  if (req.body.toggles) {
    req.body.toggles = { ...settings.ai?.toggles?.toObject(), ...req.body.toggles };
  }
  settings.ai = { ...settings.ai?.toObject(), ...req.body };
  settings.updatedBy = req.admin._id;
  await settings.save();

  console.log(`  \x1b[32m✅ AI settings updated\x1b[0m`);
  sendSuccess(res, settings.ai);
});

// ── Specific Email Settings ──────────────────────────
const updateEmailSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({});

  if (req.body.toggles) {
    req.body.toggles = { ...settings.email?.toggles?.toObject(), ...req.body.toggles };
  }
  settings.email = { ...settings.email?.toObject(), ...req.body };
  settings.updatedBy = req.admin._id;
  await settings.save();

  console.log(`  \x1b[32m✅ Email settings updated\x1b[0m`);
  sendSuccess(res, settings.email);
});

// ── Get Feature Toggles ──────────────────────────────
const getFeatureToggles = asyncHandler(async (req, res) => {
  const settings = await Setting.findOne();
  sendSuccess(res, {
    features: settings?.features || {},
    ai: settings?.ai?.toggles || {},
    email: settings?.email?.toggles || {},
  });
});

module.exports = {
  getSettings,
  updateSettings,
  updateAiSettings,
  updateEmailSettings,
  getFeatureToggles,
};