const redis = require('redis');

let client = null;

const connectRedis = async () => {
  if (process.env.REDIS_ENABLED !== 'true') {
    console.log('[Redis] Disabled — skipping connection');
    return null;
  }

  client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  client.on('connect', () => console.log('[Redis] Connected'));
  client.on('error', (err) => console.error('[Redis] Error:', err.message));

  await client.connect();
  return client;
};

const getRedisClient = () => client;

module.exports = { connectRedis, getRedisClient };