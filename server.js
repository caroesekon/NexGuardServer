require('./scripts/dnsSet');
require('dotenv').config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { generalLimiter } = require('./middleware/global/rateLimiter');
const errorHandler = require('./middleware/global/errorHandler');
const connectDB = require('./config/db');
const { connectRedis, getRedisClient } = require('./config/redis');
const { initSocket, getIO } = require('./config/socket');
const { initSchedulers } = require('./schedulers');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

const isProduction = process.env.NODE_ENV === 'production';

// ── Colors ───────────────────────────────────────────
const c = {
  reset: '\x1b[0m', bright: '\x1b[1m', dim: '\x1b[2m',
  black: '\x1b[30m', green: '\x1b[32m', yellow: '\x1b[33m',
  red: '\x1b[31m', cyan: '\x1b[36m', white: '\x1b[37m',
  bgGreen: '\x1b[42m', bgRed: '\x1b[41m', bgYellow: '\x1b[43m',
};

const connected = `${c.bgGreen}${c.black}  CONNECTED  ${c.reset}`;
const failed = `${c.bgRed}${c.white}  FAILED  ${c.reset}`;
const notConfigured = `${c.bgYellow}${c.black}  NOT CONFIGURED  ${c.reset}`;

// ── Status Trackers ──────────────────────────────────
let dbStatus = false;
let redisStatus = false;
let socketStatus = false;
let cronStatus = false;
let bridgeStatus = null;
let aiStatus = null;

// ── Database ─────────────────────────────────────────
const initDB = async () => {
  try {
    await connectDB();
    dbStatus = true;
  } catch (err) {
    logger.error(`MongoDB: ${err.message}`);
  }
};

// ── Redis ────────────────────────────────────────────
const initRedis = async () => {
  try {
    await connectRedis();
    const client = getRedisClient();
    if (client) {
      await client.set('nexguard:health', 'ok', { EX: 10 });
      redisStatus = true;
    }
  } catch (err) {
    logger.error(`Redis: ${err.message}`);
  }
};

// ── Socket.IO ────────────────────────────────────────
const initSocketIO = () => {
  try {
    initSocket(server);
    socketStatus = true;
  } catch (err) {
    logger.error(`Socket.IO: ${err.message}`);
  }
};

// ── Schedulers ───────────────────────────────────────
const initCrons = () => {
  try {
    initSchedulers();
    cronStatus = true;
  } catch (err) {
    logger.error(`Schedulers: ${err.message}`);
  }
};

// ── HDM Bridge Check ────────────────────────────────
const checkBridge = async () => {
  try {
    const Setting = require('./models/admin/Setting');
    const settings = await Setting.findOne();
    const bridgeUrl = settings?.email?.baseUrl || 'https://hdmbridgeserver.pxxl.click/api';
    const apiKey = settings?.email?.apiKey || process.env.HDM_API_KEY;
    if (!apiKey) { bridgeStatus = null; return; }
    const healthUrl = bridgeUrl.replace(/\/api$/, '') + '/health';
    const axios = require('axios');
    await axios.get(healthUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 5000,
    });
    bridgeStatus = true;
  } catch {
    bridgeStatus = false;
  }
};

// ── HDM AI Check ─────────────────────────────────────
const checkAI = async () => {
  try {
    const Setting = require('./models/admin/Setting');
    const settings = await Setting.findOne();
    const aiUrl = settings?.ai?.baseUrl || 'https://hdmaiserver.pxxl.click';
    const apiKey = settings?.ai?.apiKey || process.env.HDMAI_API_KEY;
    if (!apiKey) { aiStatus = null; return; }
    const healthUrl = aiUrl.replace(/\/api\/v1$/, '') + '/health';
    const axios = require('axios');
    await axios.get(healthUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 5000,
    });
    aiStatus = true;
  } catch {
    aiStatus = false;
  }
};

// ── Security Middleware ──────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP logging — skip in production
if (!isProduction) {
  app.use(morgan('dev'));
}

app.use(generalLimiter);

// ── Routes ───────────────────────────────────────────
const routes = require('./routes');
app.use('/api', routes);

// ── JSON Routes ──────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'NexGuard Server is running',
    version: '1.0.0',
    author: 'Davis Okoth',
    docs: '/api',
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'NexGuard API',
    version: '1.0.0',
    author: 'Davis Okoth',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      public: '/api/public',
      client: '/api/client',
      admin: '/api/admin',
      health: '/health',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      mongodb: dbStatus ? 'connected' : 'disconnected',
      redis: process.env.REDIS_ENABLED === 'true'
        ? (redisStatus ? 'connected' : 'disconnected')
        : 'disabled',
      socket: socketStatus ? 'running' : 'stopped',
      schedulers: cronStatus ? 'running' : 'stopped',
      bridge: bridgeStatus === true ? 'connected' : bridgeStatus === false ? 'unreachable' : 'not_configured',
      ai: aiStatus === true ? 'connected' : aiStatus === false ? 'unreachable' : 'not_configured',
    },
  });
});

// ── 404 ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// ── Error Handler ────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────
const start = async () => {
  const PORT = process.env.PORT || 5000;
  const serverUrl = process.env.APP_URL || `http://localhost:${PORT}`;

  if (!isProduction) {
    console.log(`\n`);
    console.log(`${c.cyan}${c.bright}  ╔══════════════════════════════════════════════════════╗${c.reset}`);
    console.log(`${c.cyan}${c.bright}  ║                                                      ║${c.reset}`);
    console.log(`${c.cyan}${c.bright}  ║          ${c.green}⚡ ${c.bright}${c.white}N E X G U A R D${c.cyan}${c.bright}                        ║${c.reset}`);
    console.log(`${c.cyan}${c.bright}  ║          ${c.dim}Next-Gen Cybersecurity Suite${c.cyan}${c.bright}                 ║${c.reset}`);
    console.log(`${c.cyan}${c.bright}  ║                                                      ║${c.reset}`);
    console.log(`${c.cyan}${c.bright}  ╚══════════════════════════════════════════════════════╝${c.reset}`);
    console.log(`${c.dim}  ${c.white}Created by${c.reset} ${c.bright}Davis Okoth${c.reset} ${c.dim}| © 2026 All rights reserved.${c.reset}`);
    console.log(``);
    console.log(`${c.dim}  Starting services...${c.reset}`);
    console.log(``);
  }

  await initDB();
  if (!isProduction) console.log(`  ${c.white}MongoDB${c.reset}      ${dbStatus ? connected : failed}`);

  await initRedis();
  if (!isProduction) {
    if (process.env.REDIS_ENABLED === 'true') {
      console.log(`  ${c.white}Redis${c.reset}        ${redisStatus ? connected : failed}`);
    } else {
      console.log(`  ${c.white}Redis${c.reset}        ${notConfigured}`);
    }
  }

  initSocketIO();
  if (!isProduction) console.log(`  ${c.white}Socket.IO${c.reset}    ${socketStatus ? connected : failed}`);

  initCrons();
  if (!isProduction) console.log(`  ${c.white}Schedulers${c.reset}   ${cronStatus ? connected : failed}`);

  await checkBridge();
  if (!isProduction) {
    if (bridgeStatus === true) console.log(`  ${c.white}HDM Bridge${c.reset}   ${connected}`);
    else if (bridgeStatus === false) console.log(`  ${c.white}HDM Bridge${c.reset}   ${failed}`);
    else console.log(`  ${c.white}HDM Bridge${c.reset}   ${notConfigured}`);
  }

  await checkAI();
  if (!isProduction) {
    if (aiStatus === true) console.log(`  ${c.white}HDM AI${c.reset}       ${connected}`);
    else if (aiStatus === false) console.log(`  ${c.white}HDM AI${c.reset}       ${failed}`);
    else console.log(`  ${c.white}HDM AI${c.reset}       ${notConfigured}`);
  }

  server.listen(PORT, () => {
    if (!isProduction) {
      console.log(``);
      console.log(`${c.bgGreen}${c.black}  ✅ SERVER RUNNING  ${c.reset}`);
      console.log(``);
      console.log(`  ${c.white}Server:${c.reset}    ${c.cyan}${serverUrl}${c.reset}`);
      console.log(`  ${c.white}Client:${c.reset}    ${c.dim}${process.env.CLIENT_URL || 'http://localhost:3000'}${c.reset}`);
      console.log(`  ${c.white}Admin:${c.reset}     ${c.dim}${process.env.ADMIN_URL || 'http://localhost:3001'}${c.reset}`);
      console.log(`  ${c.white}API:${c.reset}       ${c.dim}${process.env.NEXGUARD_GRPC_ENDPOINT || 'localhost:50051'}${c.reset}`);
      console.log(``);
    }
    logger.info(`NexGuard Server running on ${serverUrl}`);
  });
};

start();

module.exports = { app, server };