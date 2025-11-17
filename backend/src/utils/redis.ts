import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export const initializeRedis = async () => {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log('✅ Redis connected'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('Redis connection failed, continuing without Redis:', error);
    return null;
  }
};

export const getRedisClient = () => redisClient;

export const setCache = async (key: string, value: any, expirationInSeconds: number = 3600) => {
  if (!redisClient) return;
  try {
    await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

export const getCache = async (key: string) => {
  if (!redisClient) return null;
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const deleteCache = async (key: string) => {
  if (!redisClient) return;
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
};
