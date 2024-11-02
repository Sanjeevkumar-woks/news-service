import logger from "../utils/logger.js";
import { everyDayScheduler } from "./everyDayScheduler.js";
import { everyHourScheduler } from "./everyHourScheduler.js";
import { everyTenMinScheduler } from "./everyTenMinScheduler.js";
import { movieFetcherScheduler } from "./movieFetcher.js";

const startCronJobs = async () => {
  logger.info("Starting cron jobs");
  await everyDayScheduler();
  await everyHourScheduler();
  await everyTenMinScheduler();
  await movieFetcherScheduler();
  logger.info("Cron jobs started");
};

export default startCronJobs;
