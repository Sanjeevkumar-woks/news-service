import Router from "express";
import * as newsController from "../controllers/newsController.js";

const newsRoutes = Router();

newsRoutes.get("/get-news", newsController.getNews);
newsRoutes.get("/get-news-by-id/:id", newsController.getNewsById);

export default newsRoutes;
