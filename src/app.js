import express from "express";
import cors from "cors";
import newsRouter from "./routes/newsRoutes.js";
import preferencesRouter from "./routes/preferencesRouters.js";
import savedArticleRoutes from "./routes/savedArticleRoutes.js";
import notificationsRouter from "./routes/notificationsRoutes.js";
import authRouter from "./routes/authRoutes.js";

const app = express();

// middlewares to parse request body to json
app.use(express.json());

// enable cors to allow cross-origin requests
app.use(cors());

// routes to handle requests
app.use("/api/auth", authRouter);
app.use("/api/news", newsRouter);
app.use("/api/preferences", preferencesRouter);
app.use("/api/saved-articles", savedArticleRoutes);
app.use("/api/notifications", notificationsRouter);

export default app;
