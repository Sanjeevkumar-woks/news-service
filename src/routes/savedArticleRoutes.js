import Router from "express";
import * as savedArticleController from "../controllers/savedArticleController.js";

const savedArticleRoutes = Router();

//get saved articles
savedArticleRoutes.get(
  "/get-saved-articles",
  savedArticleController.getSavedArticles
);

//save article
savedArticleRoutes.post("/save-article", savedArticleController.saveArticle);

//delete saved article
savedArticleRoutes.delete(
  "/delete/:id",
  savedArticleController.deleteSavedArticle
);

export default savedArticleRoutes;
