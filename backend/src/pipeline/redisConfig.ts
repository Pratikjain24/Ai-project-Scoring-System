import Redis, { type RedisOptions } from 'ioredis';
import { ENV } from '../config/env';

export interface RedisStatus {
  connected: boolean;
  mode: 'REDIS_BULLMQ' | 'FALLBACK_PERSISTENT_SQLITE';
  host: string;
  port: number;
  db: number;
  lastChecked: string;
  error?: string;
}

let sharedClient: Redis | null = null;
let lastKnownStatus: RedisStatus = {
  connected: false,
  mode: 'FALLBACK_PERSISTENT_SQLITE',
  host: ENV.REDIS_HOST,
  port: ENV.REDIS_PORT,
  db: ENV.REDIS_DB,
  lastChecked: new Date().toISOString(),
};

/**
 * Returns BullMQ-compatible connection options
 */
export function getRedisConnectionOptions(): RedisOptions {
  if (ENV.REDIS_URL && ENV.REDIS_URL.trim().length > 0) {
    return {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        if (times > 5) return null; // Stop retrying after 5 attempts if offline
        return Math.min(times * 300, 2000);
      },
    };
  }

  return {
    host: ENV.REDIS_HOST,
    port: ENV.REDIS_PORT,
    password: ENV.REDIS_PASSWORD || undefined,
    db: ENV.REDIS_DB,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    connectTimeout: 2000,
    retryStrategy: (times: number) => {
      if (times > 5) return null; // Stop retrying after 5 attempts if offline
      return Math.min(times * 300, 2000);
    },
  };
}

/**
 * Creates a new isolated Redis client instance (e.g. for BullMQ Queue or Worker)
 */
export function createRedisClient(): Redis {
  const options = getRedisConnectionOptions();
  let client: Redis;

  if (ENV.REDIS_URL && ENV.REDIS_URL.trim().length > 0) {
    client = new Redis(ENV.REDIS_URL, options);
  } else {
    client = new Redis(options);
  }

  // Prevent uncaught ECONNREFUSED from terminating the Node process
  client.on('error', (err) => {
    lastKnownStatus = {
      connected: false,
      mode: 'FALLBACK_PERSISTENT_SQLITE',
      host: ENV.REDIS_HOST,
      port: ENV.REDIS_PORT,
      db: ENV.REDIS_DB,
      lastChecked: new Date().toISOString(),
      error: err.message,
    };
  });

  return client;
}

/**
 * Proactively tests whether Redis is reachable.
 * Returns true if Redis PING succeeds within timeout, false otherwise.
 */
export async function testRedisConnection(timeoutMs: number = 1500): Promise<boolean> {
  const client = createRedisClient();
  let timer: NodeJS.Timeout | null = null;

  try {
    const pingPromise = (async () => {
      await client.connect();
      const reply = await client.ping();
      return reply === 'PONG';
    })();

    const timeoutPromise = new Promise<boolean>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Redis connection timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    const isHealthy = await Promise.race([pingPromise, timeoutPromise]);
    if (timer) clearTimeout(timer);

    lastKnownStatus = {
      connected: isHealthy,
      mode: isHealthy ? 'REDIS_BULLMQ' : 'FALLBACK_PERSISTENT_SQLITE',
      host: ENV.REDIS_HOST,
      port: ENV.REDIS_PORT,
      db: ENV.REDIS_DB,
      lastChecked: new Date().toISOString(),
    };

    try {
      await client.quit();
    } catch {
      client.disconnect();
    }

    return isHealthy;
  } catch (err: any) {
    if (timer) clearTimeout(timer);
    lastKnownStatus = {
      connected: false,
      mode: 'FALLBACK_PERSISTENT_SQLITE',
      host: ENV.REDIS_HOST,
      port: ENV.REDIS_PORT,
      db: ENV.REDIS_DB,
      lastChecked: new Date().toISOString(),
      error: err.message,
    };

    try {
      client.disconnect();
    } catch {
      // Ignore disconnect error
    }

    return false;
  }
}

/**
 * Returns the current cached status of the Redis connection
 */
export function getRedisStatus(): RedisStatus {
  return { ...lastKnownStatus };
}

/**
 * Cleanly closes shared client if open
 */
export async function closeSharedRedis(): Promise<void> {
  if (sharedClient) {
    try {
      await sharedClient.quit();
    } catch {
      sharedClient.disconnect();
    }
    sharedClient = null;
  }
}
