import OldNewsArticle from "../models/oldNewsModel.js";
import newsService from "../services/newsService.js";
import { validateJoiSchema } from "../utils/validateSchema.js";
import Joi from "joi";
import logger from "../utils/logger.js";

// Validation schemas
const newsQuerySchema = Joi.object({
  category: Joi.string().optional(),
  country: Joi.string().optional(),
  page: Joi.number().min(1).required(),
  pageSize: Joi.number().min(1).required(),
  sort: Joi.string().optional(),
  search: Joi.string().optional(),
});

const newsIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const getNews = async (req, res) => {
  try {
    const validationError = validateJoiSchema(req.query, newsQuerySchema);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const newsArticles = await newsService.getNews(req.query);
    res.status(200).json({ newsArticles });
  } catch (error) {
    logger.error(`Failed to retrieve news: ${error.message}`);
    res.status(500).json({ error: "Failed to retrieve news articles." });
  }
};

export const getNewsById = async (req, res) => {
  try {
    const validationError = validateJoiSchema(req.params, newsIdSchema);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const news = await newsService.getNewsById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "News article not found." });
    }

    res.status(200).json({ news });
  } catch (error) {
    logger.error(`Failed to retrieve news by ID: ${error.message}`);
    res.status(500).json({ error: "Failed to retrieve news article." });
  }
};
