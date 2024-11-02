import { Queue } from "bullmq";
import { getRedisClient } from "../connectors/redisConnect.js";

const redis = getRedisClient();

// Notification Queue
const notificationQueue = new Queue("notificationQueue", {
  connection: redis,
});

export default notificationQueue;
