// src/config/redisClient.js
import { createClient } from 'redis';

// Create a Redis client
const redisClient = createClient({
  // URL for a local Redis instance. For production, use an environment variable.
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis as soon as the application starts
(async () => {
    await redisClient.connect();
    console.log('✅ Redis client connected.');
})();

export default redisClient;