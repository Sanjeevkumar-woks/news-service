import mongoose from "mongoose";
import NewsArticle from "../models/newsModel.js";
import SavedArticle from "../models/SavedArticles.js";

const getSavedArticles = async (req, res) => {
  const { user_id } = req.params;

  const savedArticles = await SavedArticle.find({ user_id });

  if (!savedArticles) {
    return res.status(404).json({ message: "No saved articles found" });
  }

  res.status(200).json(savedArticles);
};

const saveArticle = async (req, res) => {
  const { article_id, user_id } = req.body;

  const article = await NewsArticle.findOne({ article_id });

  if (!article) {
    return res.status(404).json({ message: "Article not found" });
  }
  const existingArticle = await SavedArticle.findOne({ article_id, user_id });

  if (existingArticle) {
    return res.status(400).json({ message: "Article already saved" });
  }

  //remove _id and __v creeatedAt and updatedAt
  const { _id, __v, createdAt, updatedAt, ...data } = article.toJSON();

  const savedArticle = await SavedArticle.create({
    ...data,
    user_id,
  });

  await savedArticle.save();

  if (!savedArticle) {
    return res.status(500).json({ message: "Failed to save article" });
  }

  res.status(200).json({ message: "Article saved successfully" });
};

const deleteSavedArticle = async (req, res) => {
  const { id } = req.params;

  const deletedArticle = await SavedArticle.findOneAndDelete({
    article_id: id,
  });

  if (!deletedArticle) {
    return res.status(404).json({ message: "Article not found" });
  }
  res.status(200).json({ message: "Article deleted successfully" });
};

export { getSavedArticles, saveArticle, deleteSavedArticle };
