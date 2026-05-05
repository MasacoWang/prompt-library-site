import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis: Redis };

function getRedis(): Redis {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is not set');
  }
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(process.env.REDIS_URL);
  }
  return globalForRedis.redis;
}

/** Get a value from Redis, auto-parsing JSON. Returns null if key doesn't exist. */
export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  const raw = await getRedis().get(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as unknown as T;
  }
}

/** Set a value in Redis, auto-serializing to JSON. */
export async function kvSet(key: string, value: unknown): Promise<void> {
  await getRedis().set(key, JSON.stringify(value));
}

