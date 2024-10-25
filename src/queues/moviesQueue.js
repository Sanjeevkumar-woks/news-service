import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const redis = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

const moviesFetchQueue = new Queue("moviesFetchQueue", {
  connection: redis,
});

export default moviesFetchQueue;
