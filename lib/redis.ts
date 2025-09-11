import { createClient, type RedisClientType } from 'redis';


const redisUrl = process.env.REDIS_URL || `redis://:${process.env.REDIS_PWD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`;

let client: RedisClientType;
if (!globalThis.__redisClient) {
	client = createClient({ url: redisUrl });
	client.connect().catch(console.error);
	globalThis.__redisClient = client;
} else {
	client = globalThis.__redisClient;
}
export default client;