import { Worker } from "bullmq";
import _ from "lodash";
import sendNotifications from "./sendNotifications.js";

import dotenv from "dotenv";
import newsService from "../services/newsService.js";

dotenv.config();

const redis = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};
export async function startMovieFetcherWorker() {
  const movieFetcherWorker = new Worker(
    "moviesFetchQueue",
    async (job) => {
      console.log(`Job ${job.id} started`);
      try {
        const newArticles = await newsService.fetchAndSaveArticles();

        if (newArticles.length > 0) {
          await sendNotifications(newArticles);
          console.log("New articles email sent successfully.");
        } else {
          console.log("No new articles found.");
        }

        return { success: true, newArticlesCount: newArticles.length };
      } catch (error) {
        console.error(`Error in job ${job.id}: ${error.message}`);
        return { success: false, error: error.message };
      }
    },
    { connection: redis, backoffStrategies: { exponential: true } }
  );

  movieFetcherWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed with result:`, job.returnvalue);
  });

  movieFetcherWorker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
  });

  console.log("movieFetcherWorker is running...");
}

export default startMovieFetcherWorker;
