import mongoose from "mongoose";

const savedArticleSchema = new mongoose.Schema({
  article_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  url: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const SavedArticle = mongoose.model("SavedArticle", savedArticleSchema);

export default SavedArticle;
