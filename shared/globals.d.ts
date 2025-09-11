import type { PrismaClient } from '@prisma/client';
import type { RedisClientType } from 'redis';

declare global {
  var _prisma: PrismaClient | undefined;
  var __redisClient: RedisClientType | undefined;
}

export {};