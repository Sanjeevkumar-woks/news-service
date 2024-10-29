import { Worker } from "bullmq";
import _ from "lodash";
import sendNotifications from "./sendNotifications.js";

import dotenv from "dotenv";
import newsService from "../services/newsService.js";
import logger from "../utils/logger.js";

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
      console.log("movie fetcher worker started");
      logger.info(`Job ${job.id} started movie fetcher worker`);
      try {
        const newArticles = await newsService.fetchAndSaveArticles();
        console.log(newArticles, "newArticles");

        // if (newArticles.length > 0) {
        //   await sendNotifications(newArticles);
        //   logger.info("New articles email sent successfully.");
        // } else {
        //   logger.info("No new articles found.");
        // }

        return { success: true, newArticlesCount: newArticles.length };
      } catch (error) {
        logger.error(
          `Error in job ${job.id}: ${error.message} ,"Error in Movie fetcher worker"`
        );
        if (error.name === "NetworkError") {
          logger.info("Network error in movie fetcher worker");
          // Handle network-related errors
          return { success: false, error: "Network error", retryable: true };
        } else if (error.name === "ValidationError") {
          logger.info("Data validation error in movie fetcher worker");
          // Handle data validation errors
          return {
            success: false,
            error: "Data validation error",
            retryable: false,
          };
        }
        // Handle other types of errors
        return { success: false, error: error.message, retryable: true };
      }
    },
    { connection: redis, backoffStrategies: { exponential: true } }
  );

  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, closing worker");
    await movieFetcherWorker.close();
  });

  movieFetcherWorker.on("completed", (job) => {
    logger.info(
      `Job ${job.id} movie-fetcher-worker completed with result:`,
      job.returnvalue
    );
  });

  movieFetcherWorker.on("failed", (job, err) => {
    logger.error(
      `Job ${job.id} movie-fetcher-worker failed with error: ${err.message}`
    );
  });

  logger.info("movieFetcherWorker is running...");
}

export default startMovieFetcherWorker;
