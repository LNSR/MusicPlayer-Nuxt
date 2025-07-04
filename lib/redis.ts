import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL as string);

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redis;