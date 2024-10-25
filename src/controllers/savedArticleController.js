import SavedArticle from "../models/SavedArticles.js";

const getSavedArticles = async (req, res) => {
  const { user_id } = req.query;

  const savedArticles = await SavedArticle.find({ user_id });

  res.status(200).json(savedArticles);
};

const saveArticle = async (req, res) => {
  const { article_id, title, description, image, url, user_id } = req.body;

  const existingArticle = await SavedArticle.findOne({ article_id });

  if (existingArticle) {
    return res.status(400).json({ message: "Article already saved" });
  }

  const savedArticle = await SavedArticle.create({
    article_id,
    title,
    description,
    image,
    url,
    user_id,
  });

  res.status(200).json({ message: "Article saved successfully" });
};

const deleteSavedArticle = async (req, res) => {
  const { id } = req.params;

  const deletedArticle = await SavedArticle.findByIdAndDelete(id);

  if (!deletedArticle) {
    return res.status(404).json({ message: "Article not found" });
  }

  res.status(200).json({ message: "Article deleted successfully" });
};

export { getSavedArticles, saveArticle, deleteSavedArticle };
