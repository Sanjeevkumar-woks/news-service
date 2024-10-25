import Router from "express";
import * as userController from "../controllers/userControllers.js";

const userRoutes = Router();

userRoutes.post("/signup", userController.signup);
userRoutes.post("/login", userController.login);
userRoutes.get("/profile/:user_id", userController.getProfile);

export default userRoutes;
