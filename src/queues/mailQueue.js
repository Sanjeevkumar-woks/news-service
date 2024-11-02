import { Queue } from "bullmq";
import { getRedisClient } from "../connectors/redisConnect.js";

const redis = getRedisClient();

// Mail Queue
const mailQueue = new Queue("mailQueue", {
  connection: redis,
});

export default mailQueue;
