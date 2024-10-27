import axios from "axios";
import NewsArticle from "../models/newsModel.js";
import _ from "lodash";

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

    //get unique articles by article_id and title  using lodash
    const uniqueArticles = _.uniqBy(fetchedArticles, "article_id");

    const existingArticleIds = await NewsArticle.distinct("article_id");
    const existingArticleIdSet = new Set(existingArticleIds);

    const newNewsArticles = uniqueArticles.filter(
      (article) => !existingArticleIdSet.has(article.article_id)
    );

    if (newNewsArticles.length > 0) {
      await NewsArticle.insertMany(newNewsArticles);
      console.log("News fetched and saved successfully.");
    }

    return newNewsArticles;
  }
}
