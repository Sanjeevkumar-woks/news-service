import axios from "axios";
import NewsArticle from "../models/newsModel.js";
import _ from "lodash";
import logger from "../utils/logger.js";

export default class newsService {
  // Function to  get news with filters and pagination
  static async getNews(params) {
    try {
      const {
        category,
        country,
        page = 1,
        pageSize = 10,
        sort = "-createdAt",
        search,
      } = params;
      const query = {};

      if (category) query.category = { $in: [category] };
      if (country) query.country = { $in: [country] };
      if (search) query.title = { $regex: search, $options: "i" };
      query.image_url = { $ne: null };

      const newsArticles = await NewsArticle.find(query)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(Number(pageSize));

      if (!newsArticles.length) {
        return { message: "No news articles found" };
      }

      return newsArticles;
    } catch (error) {
      logger.error(`Error fetching news articles: ${error.message}`);
      throw new Error("Error retrieving news articles.");
    }
  }

  //get news by article id
  static async getNewsById(id) {
    try {
      const news = await NewsArticle.findOne({ article_id: id });
      if (!news) return null;

      return news;
    } catch (error) {
      logger.error(`Error fetching news article by ID: ${error.message}`);
      throw new Error("Error retrieving news article by ID.");
    }
  }

  // Function to fetch and save news articles from the newsdata.io API
  static async fetchAndSaveArticles() {
    try {
      const response = await axios.get(
        `https://newsdata.io/api/1/news?apikey=pub_57205dc3e5674001387470f8dac81af1b6c58&language=en`
      );

      // Filter out duplicate articles
      const fetchedArticles = response.data.results || [];

      console.log(fetchedArticles.length, "fetchedArticles");

      // Filter out duplicate articles
      let uniqueArticles = _.uniqBy(fetchedArticles, "article_id");
      uniqueArticles = _.uniqBy(uniqueArticles, "title");
      console.log(uniqueArticles.length);

      // Save unique articles using bulkWrite and upsert
      const bulkOps = uniqueArticles.map((article) => ({
        updateOne: {
          filter: { article_id: article.article_id },
          update: { $set: article },
          upsert: true,
        },
      }));
      console.log(bulkOps);

      const result = await NewsArticle.bulkWrite(bulkOps);

      logger.info(`Fetched and saved ${uniqueArticles.length} new articles.`);

      return uniqueArticles;
    } catch (error) {
      logger.error(`Error fetching and saving articles: ${error.message}`);
      throw new Error("Error fetching and saving articles.");
    }
  }
}
