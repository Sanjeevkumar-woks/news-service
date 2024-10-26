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

export async function startMovieFetcherWorker() {
  const movieFetcherWorker = new Worker(
    "moviesFetchQueue",
    async (job) => {
      console.log(`Job ${job.id} started`);
      try {
        // Fetch news from an external API
        const response = await axios.get(
          "https://newsdata.io/api/1/news?apikey=pub_57205dc3e5674001387470f8dac81af1b6c58&language=en"
        );

        const fetchedArticles = response.data.results || [];

        // Fetch existing news articles from the database
        const existingArticles = await NewsArticle.find({}, { article_id: 1 });
        console.log(`${existingArticles.length} existing articles found.`);

        // Filter out the new articles that are not in the database
        const newNewsArticles = fetchedArticles.filter(
          (article) =>
            !existingArticles.some(
              (existing) => existing.article_id === article.article_id
            )
        );

        console.log(`${newNewsArticles.length} new articles found.`);

        // Insert new articles into the database if there are any
        if (newNewsArticles.length > 0) {
          await NewsArticle.insertMany(newNewsArticles);
          console.log("News fetched and saved successfully.");
          await OldNewsArticle.insertMany(newNewsArticles);
          await emailNotification(newNewsArticles);
          console.log("New News articles email sent successfully.");
        } else {
          console.log("No new articles found.");
        }

        // Return the result of the job
        return { success: true, newArticlesCount: newNewsArticles.length };
      } catch (error) {
        console.error(
          `Error fetching news for job ${job.id}: ${error.message}`
        );
        // Handle the error gracefully, so the worker can continue processing new jobs
        return { success: false, error: error.message };
      }
    },
    { connection: redis }
  );

  // Listen for 'completed' events to log job status
  movieFetcherWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed with result:`, job.returnvalue);
  });

  // Listen for 'failed' events to log job failures
  movieFetcherWorker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
  });

  console.log("movieFetcherWorker is running...");
}

export default startMovieFetcherWorker;
