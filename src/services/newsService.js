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
}
