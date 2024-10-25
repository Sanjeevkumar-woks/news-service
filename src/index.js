import app from "./app.js";
import { dbConnect } from "./connectors/dbConnect.js";
import { startNewsFetchCron } from "./workers/news-fetch.js";

const mongoUrl = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const port = process.env.PORT;

try {
  await dbConnect(mongoUrl, dbName);
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    startNewsFetchCron();
  });
} catch (error) {
  console.error(`Error in starting server: ${err}`);
  process.exit(1);
}
