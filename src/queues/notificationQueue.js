import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const redis = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

const notificationQueue = new Queue("notificationQueue", {
  connection: redis,
});

export default notificationQueue;
