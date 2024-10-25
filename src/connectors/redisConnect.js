import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
const redisPassword = process.env.REDIS_PASSWORD;

const connectionClient = createClient({
  url: `redis://${redisHost}:${redisPort}`,
  password: redisPassword,
});

const connectToRedis = async () => {
  try {
    await connectionClient.connect();
    console.log("Redis client connected");
  } catch (err) {
    console.error(`Error connecting to Redis: ${err}`);
    connectionClient.disconnect();
  }
};
const getRedisClient = () => {
  return connectionClient;
};

export { connectToRedis, getRedisClient };
