import express from "express";
import cors from "cors";
import newsRouter from "./routes/newsRoutes.js";
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/news", newsRouter);

export default app;
