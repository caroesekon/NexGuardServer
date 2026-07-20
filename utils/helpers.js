const { getRedisClient } = require('../config/redis');

// ── Response Helpers ─────────────────────────────────
const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

const sendPaginated = (res, data, meta) => {
  res.status(200).json({
    success: true,
    data,
    meta,
  });
};

// ── Cache Helpers ────────────────────────────────────
const cacheGet = async (key) => {
  const redis = getRedisClient();
  if (!redis) return null;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

const cacheSet = async (key, value, ttl = 3600) => {
  const redis = getRedisClient();
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), { EX: ttl });
};

const cacheDel = async (key) => {
  const redis = getRedisClient();
  if (!redis) return;
  await redis.del(key);
};

// ── OTP ──────────────────────────────────────────────
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const verifyOTP = (storedOTP, inputOTP) => {
  return storedOTP === inputOTP;
};

// ── License Key ──────────────────────────────────────
const generateLicenseKey = (plan = 'pro') => {
  const prefix = plan.substring(0, 3).toUpperCase();
  const segments = [
    prefix,
    Math.random().toString(36).substring(2, 6).toUpperCase(),
    Math.random().toString(36).substring(2, 6).toUpperCase(),
    Math.random().toString(36).substring(2, 6).toUpperCase(),
  ];
  return segments.join('-');
};

const validateLicenseKey = (key) => {
  const pattern = /^[A-Z]{3}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(key);
};

// ── Threat Level ─────────────────────────────────────
const calculateThreatLevel = (score) => {
  if (score >= 0.8) return 'critical';
  if (score >= 0.6) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
};

// ── Pagination ───────────────────────────────────────
const paginateQuery = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  const sort = query.sort || '-createdAt';

  return { page, limit, skip, sort };
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
  cacheGet,
  cacheSet,
  cacheDel,
  generateOTP,
  verifyOTP,
  generateLicenseKey,
  validateLicenseKey,
  calculateThreatLevel,
  paginateQuery,
};