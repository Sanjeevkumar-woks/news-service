import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
const redisPassword = process.env.REDIS_PASSWORD;

// Create Redis client
const connectionClient = createClient({
  url: `redis://${redisHost}:${redisPort}`,
  password: redisPassword,
});

// Connect to Redis
const connectToRedis = async () => {
  try {
    await connectionClient.connect();
    console.log("Redis client connected");
  } catch (err) {
    console.error(`Error connecting to Redis: ${err}`);
    connectionClient.disconnect();
  }
};

// Export Redis client
const redis = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

// Get Redis client
const getRedisClient = () => {
  return redis;
};

export { connectToRedis, getRedisClient };
