import app from "./app.js";
import { dbConnect } from "./connectors/dbConnect.js";
import dotenv from "dotenv";
import startCronJobs from "./schedulers/index.js";
dotenv.config();

// Connect to MongoDB
const mongoUrl = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const port = process.env.PORT;

try {
  // Connect to MongoDB
  await dbConnect(mongoUrl, dbName);

  // Listen on port
  app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);

    // Connect to Redis and run workers and cron jobs
    //try {
    // await connectToRedis();
    // await movieFetcherScheduler();
    // await startWorkers();
    // } catch (redisError) {
    //   console.error(`Error connecting to Redis: ${redisError}`);
    // }

    try {
      // Start cron jobs for movie fetcher and notifications scheduler
      await startCronJobs();
      console.log("Cron jobs and notification scheduler started");
    } catch (error) {
      // Log error and exit process
      console.error(`Error in starting cron jobs: ${error.message}`);
    }
  });
} catch (error) {
  // Log error and exit process
  console.error(`Error in starting server: ${error}`);
  process.exit(1);
}
