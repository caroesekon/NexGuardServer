const Joi = require('joi');

// ── Auth ─────────────────────────────────────────────
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).messages({
    'any.only': 'Passwords do not match',
  }),
  plan: Joi.string().allow(''),
  billing: Joi.string().allow(''),
  device_name: Joi.string().allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  device_name: Joi.string().allow(''),
  browser: Joi.string().allow(''),
  os: Joi.string().allow(''),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(128).required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

// ── User ─────────────────────────────────────────────
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  avatar: Joi.string().uri(),
});

// ── Admin ────────────────────────────────────────────
const createAdminSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('super_admin', 'moderator', 'billing_admin'),
});

const updatePlanSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  price: Joi.number().min(0).required(),
  deviceLimit: Joi.number().min(1).required(),
  scansPerDay: Joi.number().min(0).required(),
  vpnIncluded: Joi.boolean(),
  bandwidthLimitGB: Joi.number().min(0),
  features: Joi.array().items(Joi.string()),
  isActive: Joi.boolean(),
  isPopular: Joi.boolean(),
  sortOrder: Joi.number(),
  pricing: Joi.object({
    monthly: Joi.number().min(0),
    yearly: Joi.number().min(0),
    oneTime: Joi.number().min(0),
  }),
  currency: Joi.string(),
});

const updateSettingsSchema = Joi.object({
  appName: Joi.string().min(2).max(50),
  supportEmail: Joi.string().email(),
  supportPhone: Joi.string().allow(''),
  currency: Joi.string(),
  rateLimitWindow: Joi.number().min(1),
  rateLimitMax: Joi.number().min(1),
  maintenanceMode: Joi.boolean(),
});

// ── Firewall ─────────────────────────────────────────
const firewallRuleSchema = Joi.object({
  action: Joi.string().valid('allow', 'block', 'log_only').required(),
  direction: Joi.string().valid('inbound', 'outbound', 'both').required(),
  protocol: Joi.string().allow(''),
  remoteIp: Joi.string().allow(''),
  remotePort: Joi.number().allow(0),
  localPort: Joi.string().allow(''),
  application: Joi.string().allow(''),
  enabled: Joi.boolean(),
  priority: Joi.number().integer().min(0),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  createAdminSchema,
  updatePlanSchema,
  updateSettingsSchema,
  firewallRuleSchema,
};