import axios from "axios";
import NewsArticle from "../models/newsModel.js";
import _ from "lodash";
import logger from "../utils/logger.js";

export default class newsService {
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

  static async fetchAndSaveArticles() {
    try {
      const response = await axios.get(
        `https://newsdata.io/api/1/news?apikey=pub_57205dc3e5674001387470f8dac81af1b6c58&language=en`
      );
      const fetchedArticles = response.data.results || [];

      console.log(fetchedArticles.length, "fetchedArticles");

      const fieldsToRemove = [
        "ai_tag",
        "sentiment",
        "sentiment_stats",
        "ai_region",
        "ai_org",
        "duplicate",
      ];
      //use lodash omit to remove the fields
      const cleanedArticles = _.omit(fetchedArticles, fieldsToRemove);

      const uniqueArticles = _.uniqBy(cleanedArticles, "article_id");

      const existingArticleIds = await NewsArticle.distinct("article_id");
      const existingArticleIdSet = new Set(existingArticleIds);

      const newNewsArticles = uniqueArticles.filter(
        (article) => !existingArticleIdSet.has(article.article_id)
      );

      if (newNewsArticles.length) {
        const result = await NewsArticle.insertMany(newNewsArticles);

        logger.info(
          `Fetched and saved ${newNewsArticles.length} new articles.`
        );
      } else {
        logger.info("No new articles to save.");
      }

      return newNewsArticles;
    } catch (error) {
      logger.error(`Error fetching and saving articles: ${error.message}`);
      throw new Error("Error fetching and saving articles.");
    }
  }
}
