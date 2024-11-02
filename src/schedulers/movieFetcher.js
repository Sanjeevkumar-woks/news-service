import cron from "node-cron";
import _ from "lodash";
import newsService from "../services/newsService.js";
import logger from "../utils/logger.js";

export const movieFetcherScheduler = () => {
  // Schedule the cron job to run every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    logger.info("Movie fetcher cron job started");

    try {
      // Fetch new news articles and save them
      const newArticles = await newsService.fetchAndSaveArticles();

      console.log(newArticles.length, "newArticles");

      // Fetch new news articles and save them
      if (newArticles.length > 0) {
        logger.info("New articles saved successfully.");
      } else {
        logger.info("No new articles found.");
      }

      logger.info(
        `Movie fetcher cron job completed with ${newArticles.length} new articles.`
      );
    } catch (error) {
      logger.error(`Error in movie fetcher cron job: ${error.message}`);

      if (error.name === "NetworkError") {
        logger.info("Network error in movie fetcher cron job");
      } else if (error.name === "ValidationError") {
        logger.info("Data validation error in movie fetcher cron job");
      }
    }
  });

  logger.info("Movie fetcher cron job is scheduled and running...");
};
