import Router from "express";
import * as newsController from "../controllers/newsController.js";

const newsRoutes = Router();

//get news
newsRoutes.get("/get-news", newsController.getNews);

//get news by id
newsRoutes.get("/get-news-by-id/:id", newsController.getNewsById);

export default newsRoutes;
