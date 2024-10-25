import app from "./app.js";
import { dbConnect } from "./connectors/dbConnect.js";
import startNewsBackupCron from "./workers/news-clean.js";
import { startNewsFetchCron } from "./workers/news-fetch.js";

const mongoUrl = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const port = process.env.PORT;

try {
  await dbConnect(mongoUrl, dbName);
  app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);

    //startNewsBackupCron();

    try {
      startNewsFetchCron();
    } catch (redisError) {
      console.error(`Error connecting to Redis: ${redisError}`);
      // Optionally, you can choose to exit the process or continue without Redis
      // process.exit(1);
    }
  });
} catch (error) {
  console.error(`Error in starting server: ${error}`);
  process.exit(1);
}
