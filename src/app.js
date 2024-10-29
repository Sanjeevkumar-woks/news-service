import express from "express";
import cors from "cors";
import newsRouter from "./routes/newsRoutes.js";
import preferencesRouter from "./routes/preferencesRouters.js";
import userRoutes from "./routes/userRoutes.js";
import savedArticleRoutes from "./routes/savedArticleRoutes.js";
import notificationsRouter from "./routes/notificationsRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/news", newsRouter);
app.use("/api/preferences", preferencesRouter);
app.use("/api/users", userRoutes);
app.use("/api/saved-articles", savedArticleRoutes);
app.use("/api/notifications", notificationsRouter);

export default app;
