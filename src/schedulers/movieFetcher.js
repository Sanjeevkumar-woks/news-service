import cron from "node-cron";
import _ from "lodash";
import newsService from "../services/newsService.js";
import logger from "../utils/logger.js";

export function startMovieFetcherCronJob() {
  // Schedule the cron job to run every 30
  cron.schedule("*/10 * * * *", async () => {
    console.log("Movie fetcher cron job started");
    logger.info("Movie fetcher cron job started");

    try {
      const newArticles = await newsService.fetchAndSaveArticles();

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
}

export default startMovieFetcherCronJob;
