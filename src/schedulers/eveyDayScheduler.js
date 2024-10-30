import NewsArticle from "../models/newsModel.js";
import { sendNotifications } from "../workers/sendNotifications.js";

const everyMinuteScheduler = () => {
  console.log("everyMinuteScheduler started");
  setInterval(async () => {
    // Get the current time and one minute ago
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);

    // Find articles created in the last minute
    const latestArticles = await NewsArticle.find({
      createdAt: { $gte: oneMinuteAgo, $lte: now },
    }).sort({ createdAt: -1 });

    console.log(
      `Found ${latestArticles.length} new articles in the last minute`
    );

    if (latestArticles.length > 0) {
      await sendNotifications(latestArticles);
    }
  }, 60000); // Run every 600 seconds (10 minutes)
};

export default everyMinuteScheduler;
