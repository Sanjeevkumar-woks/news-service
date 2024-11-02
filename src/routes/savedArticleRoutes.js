import Router from "express";
import * as savedArticleController from "../controllers/savedArticleController.js";

const savedArticleRoutes = Router();

//save article
savedArticleRoutes.post("/save", savedArticleController.saveArticle);

//get saved articles
savedArticleRoutes.get(
  "/get/:user_id",
  savedArticleController.getSavedArticles
);

//delete saved article
savedArticleRoutes.delete(
  "/delete/:id",
  savedArticleController.deleteSavedArticle
);

export default savedArticleRoutes;
