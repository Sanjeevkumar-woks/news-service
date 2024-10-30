import { Queue } from "bullmq";
import { getRedisClient } from "../connectors/redisConnect.js";

const redis = getRedisClient();

const moviesFetchQueue = new Queue("moviesFetchQueue", {
  connection: redis,
});

export default moviesFetchQueue;
