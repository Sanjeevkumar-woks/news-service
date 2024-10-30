import { Router } from "express";
import { AuthController } from "../controllers/authController.js";

const authRoutes = Router();

// Register Route
authRoutes.post("/register", AuthController.register);

// Login Route
authRoutes.post("/login", AuthController.login);

//logout route
authRoutes.post("/logout", AuthController.logout);

// forget password
authRoutes.post("/forgetPassword", AuthController.forgetPassword);

// reset password
authRoutes.post("/resetPassword", AuthController.resetPassword);

// export auth Route
export default authRoutes;
