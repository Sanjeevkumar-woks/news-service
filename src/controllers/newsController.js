import OldNewsArticle from "../models/oldNewsModel.js";
import newsService from "../services/newsService.js";
import { validateJoiSchema } from "../utils/validateSchema.js";

const getNews = async (req, res) => {
  const validationError = validateJoiSchema({
    schema: Joi.object({
      category: Joi.string().optional(),
      country: Joi.string().optional(),
      page: Joi.number().optional(),
      pageSize: Joi.number().optional(),
      sort: Joi.string().optional(),
      search: Joi.string().optional(),
    }),
  });

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const newsArticles = await newsService.getNews(req.query);

  res.status(200).json({
    newsArticles,
  });
};

const getNewsById = async (req, res) => {
  const { id } = req.params;

  const validationError = validateJoiSchema({
    schema: Joi.object({
      id: Joi.string().required(),
    }),
  });

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const news = await newsService.getNewsById(id);

  res.status(200).json({
    news,
  });
};

export { getNews, getNewsById };
