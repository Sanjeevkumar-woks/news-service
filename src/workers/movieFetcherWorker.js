import { Worker } from "bullmq";
import axios from "axios";
import _ from "lodash";
import NewsArticle from "../models/newsModel.js";
import OldNewsArticle from "../models/oldNewsModel.js";
import emailNotification from "./notifications.js";
import dotenv from "dotenv";

dotenv.config();

const redis = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

const movieFetcherWorker = new Worker(
  "moviesFetchQueue",
  async (job) => {
    console.log("movieFetcherWorker started");
    try {
      // Fetch news from an external API
      const response = await axios.get(
        "https://newsdata.io/api/1/news?apikey=pub_57205dc3e5674001387470f8dac81af1b6c58&language=en"
      );

      const fetchedArticles = response.data.results;

      // Fetch old news articles from the database
      const oldNewsArticles = await NewsArticle.find();

      console.log(oldNewsArticles.length, "old");

      let newNewsArticles = _.differenceBy(
        fetchedArticles,
        oldNewsArticles,
        "article_id"
      );

      // Remove duplicate articles
      newNewsArticles = _.uniqBy(newNewsArticles, "article_id");

      console.log(newNewsArticles.length, "new");

      // Insert new articles into the database
      if (!_.isEmpty(newNewsArticles)) {
        await NewsArticle.insertMany(newNewsArticles);
        console.log("News fetched and saved successfully.");
        await OldNewsArticle.insertMany(newNewsArticles);
        await emailNotification(newNewsArticles);
        console.log("New News articles email sent successfully");
      }

      // Return the result of the job
      return { success: true, newArticlesCount: newNewsArticles.length };
    } catch (error) {
      console.error("Error fetching news:", error);
      throw error; // Rethrow the error to mark the job as failed
    }
  },
  {
    connection: redis,
  }
);

export default movieFetcherWorker;
