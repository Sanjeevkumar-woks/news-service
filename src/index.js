import app from "./app.js";
import { dbConnect } from "./connectors/dbConnect.js";
import { connectToRedis } from "./connectors/redisConnect.js";
import dotenv from "dotenv";
import movieFetcherScheduler from "./schedulers/movieFetcherScheduler.js";
import { startWorkers } from "./workers/index.js";
import everyMinuteScheduler from "./schedulers/eveyDayScheduler.js";
dotenv.config();

const mongoUrl = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const port = process.env.PORT;

try {
  await dbConnect(mongoUrl, dbName);
  app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);

    try {
      // await connectToRedis();
      // await everyMinuteScheduler();
      // await movieFetcherScheduler();
      // await startWorkers();
    } catch (redisError) {
      console.error(`Error connecting to Redis: ${redisError}`);
    }
  });
} catch (error) {
  console.error(`Error in starting server: ${error}`);
  process.exit(1);
}
