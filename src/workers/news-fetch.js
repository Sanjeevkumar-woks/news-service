import axios from "axios";
import cron from "node-cron";
import NewsArticle from "../models/newsModel.js";
import dotenv from "dotenv";
import emailNotification from "./notifications.js";
import _ from "lodash";
dotenv.config();

export function startNewsFetchCron() {
  // Schedule the task to run every min
  cron.schedule("* * * * *", async () => {
    try {
      // Fetch news from an external API
      const response = await axios.get(
        "https://newsdata.io/api/1/news?apikey=pub_57205dc3e5674001387470f8dac81af1b6c58&q=Music&country=in&language=en"
      );

      const fetchedArticles = response.data.results;

      //fetch old news articles from the database saved in last 10 minutes
      const oldNewsArticles = await NewsArticle.find();

      console.log(oldNewsArticles.length, "old");

      const newNewsArticles = _.differenceBy(
        fetchedArticles,
        oldNewsArticles,
        "article_id"
      );

      console.log(newNewsArticles.length, "new");

      // Insert new articles into the database
      if (!_.isEmpty(newNewsArticles)) {
        await NewsArticle.insertMany(newNewsArticles);
        console.log("News fetched and saved successfully.");
        await emailNotification(newNewsArticles);
        console.log("Email sent successfully");
      }

      // Uncomment and implement this function if needed
      // await notifyUsersBasedOnPreferences(newsArticles);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  });

  console.log("News fetch cron job scheduled.");
}
