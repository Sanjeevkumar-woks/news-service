import axios from "axios";
import OldNewsArticle from "../models/oldNewsModel.js";
import NewsArticle from "../models/newsModel.js";

export default class newsService {
  static async getNews(params) {
    const { category, country, page, pageSize, sort, search } = params;

    const query = {
      category: { $in: [category] } || { $in: ["top", "latest"] },
      country: { $in: [country] },
      title: { $regex: search, $options: "i" },
      ...(sort && { sort: { createdAt: sort } }),
    };

    const newsArticles = await OldNewsArticle.find(query)
      .skip(page * pageSize)
      .limit(pageSize);

    return newsArticles;
  }

  static async getNewsById(id) {
    const news = await OldNewsArticle.findById({ article_id: id });
    return news;
  }

  static async fetchAndSaveArticles() {
    const response = await axios.get(
      "https://newsdata.io/api/1/news?apikey=pub_57205dc3e5674001387470f8dac81af1b6c58&language=en"
    );
    const fetchedArticles = response.data.results || [];

    const existingArticleIds = await NewsArticle.find(
      {},
      { article_id: 1 }
    ).lean();
    const existingArticleIdSet = new Set(
      existingArticleIds.map((article) => article.article_id)
    );

    const newNewsArticles = fetchedArticles.filter(
      (article) => !existingArticleIdSet.has(article.article_id)
    );

    if (newNewsArticles.length > 0) {
      await NewsArticle.insertMany(newNewsArticles);
      await OldNewsArticle.insertMany(newNewsArticles);
      console.log("News fetched and saved successfully.");
    }

    return newNewsArticles;
  }
}
