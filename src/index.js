import app from "./app.js";
import { dbConnect } from "./connectors/dbConnect.js";
import { connectToRedis } from "./connectors/redisConnect.js";
import dotenv from "dotenv";
import movieFetcherScheduler from "./schedulers/movieFetcherScheduler.js";
import { startWorkers } from "./workers/index.js";
import { everyDayScheduler } from "./schedulers/eveyDayScheduler.js";
import { everyHourScheduler } from "./schedulers/everyHourScheduler.js";
import { everyTenMinScheduler } from "./schedulers/everyTenMinScheduler.js";
import startMovieFetcherCronJob from "./schedulers/movieFetcher.js";

dotenv.config();

const mongoUrl = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const port = process.env.PORT;

try {
  await dbConnect(mongoUrl, dbName);
  app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);

    //try {
    // await connectToRedis();
    // await movieFetcherScheduler();
    // await startWorkers();
    // } catch (redisError) {
    //   console.error(`Error connecting to Redis: ${redisError}`);
    // }

    try {
      await startMovieFetcherCronJob();
      await everyTenMinScheduler();
      await everyHourScheduler();
      await everyDayScheduler();
    } catch (error) {
      console.error(`Error in starting cron jobs: ${error.message}`);
    }
  });
} catch (error) {
  console.error(`Error in starting server: ${error}`);
  process.exit(1);
}
