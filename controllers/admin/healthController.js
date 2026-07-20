const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/helpers');
const mongoose = require('mongoose');
const os = require('os');
const { getRedisClient } = require('../../config/redis');
const { getConfig: getAiConfig } = require('../../config/hdmAi');
const { getConfig: getBridgeConfig } = require('../../config/hdmBridge');

const getHealth = asyncHandler(async (req, res) => {
  const uptime = process.uptime();

  const server = {
    status: 'running',
    url: `${req.protocol}://${req.get('host')}`,
    uptime: Math.floor(uptime),
    uptimeFormatted: formatUptime(uptime),
    nodeVersion: process.version,
    platform: os.platform(),
    memoryUsage: {
      total: formatBytes(os.totalmem()),
      free: formatBytes(os.freemem()),
      used: formatBytes(process.memoryUsage().heapUsed),
    },
    cpuLoad: os.loadavg(),
  };

  let api = {
    status: 'unknown',
    url: process.env.NEXGUARD_GRPC_ENDPOINT || 'localhost:50051',
    uptime: null,
    uptimeFormatted: null,
    version: null,
    rustVersion: null,
    platform: null,
    memoryUsed: null,
  };

  try {
    const axios = require('axios');
    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
    const response = await axios.get(`${baseUrl}/api/public/v1/engine/health`, {
      timeout: 5000,
    });
    const health = response.data.data;

    const uptimeSecs = parseInt(health.uptime_seconds) || 0;

    api.status = 'running';
    api.uptime = uptimeSecs;
    api.uptimeFormatted = formatUptime(uptimeSecs);
    api.version = health.engine_version || 'unknown';
    api.rustVersion = health.rust_version || 'unknown';
    api.platform = health.platform || 'unknown';
    api.memoryUsed = health.memory_used ? formatBytes(health.memory_used) : 'unknown';
  } catch (err) {
    api.status = 'unreachable';
    api.error = err.message;
  }

  const db = {
    status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    host: mongoose.connection.host || 'unknown',
    name: mongoose.connection.name || 'unknown',
    collections: Object.keys(mongoose.connection.collections || {}).length,
  };

  let redis = { status: 'disabled' };
  if (process.env.REDIS_ENABLED === 'true') {
    try {
      const client = getRedisClient();
      if (client) {
        await client.ping();
        redis.status = 'connected';
      } else {
        redis.status = 'disconnected';
      }
    } catch {
      redis.status = 'disconnected';
    }
  }

  let bridge = { status: 'not_configured' };
  try {
    const config = await getBridgeConfig();
    if (config.apiKey) {
      bridge.url = config.baseURL;
      try {
        const axios = require('axios');
        const healthUrl = config.baseURL.replace(/\/api$/, '') + '/health';
        await axios.get(healthUrl, {
          headers: { Authorization: `Bearer ${config.apiKey}` },
          timeout: 5000,
        });
        bridge.status = 'connected';
      } catch {
        bridge.status = 'unreachable';
      }
    }
  } catch {
    bridge.status = 'not_configured';
  }

  let ai = { status: 'not_configured' };
  try {
    const config = await getAiConfig();
    if (config.apiKey) {
      ai.url = config.baseURL;
      try {
        const axios = require('axios');
        const healthUrl = config.baseURL.replace(/\/api\/v1$/, '') + '/health';
        await axios.get(healthUrl, {
          headers: { Authorization: `Bearer ${config.apiKey}` },
          timeout: 5000,
        });
        ai.status = 'connected';
      } catch {
        ai.status = 'unreachable';
      }
    }
  } catch {
    ai.status = 'not_configured';
  }

  sendSuccess(res, {
    timestamp: new Date().toISOString(),
    server,
    api,
    database: db,
    redis,
    bridge,
    ai,
  });
});

const formatUptime = (seconds) => {
  if (!seconds || seconds <= 0) return '0s';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
};

const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(1)} ${units[i]}`;
};

module.exports = { getHealth };