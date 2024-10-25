import express from "express";
import NewsAPI from "newsapi";
import dotenv from "dotenv";

dotenv.config();

const newsRouter = express.Router();

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

// Route to fetch news based on constraints
newsRouter.get("/fetch-news", async (req, res) => {
  const {
    q,
    sources,
    domains,
    excludeDomains,
    from,
    to,
    language,
    sortBy,
    pageSize,
    page,
  } = req.query;
  const params = {
    q: q || "",
    sources: sources || "",
    domains: domains || "",
    excludeDomains: excludeDomains || "",
    from: from || "",
    to: to || "",
    language: language || "en",
    sortBy: sortBy || "publishedAt",
    pageSize: pageSize || 100,
    page: page || 1,
  };

  try {
    const response = await newsapi.v2.everything(params);
    res.json(response);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Error fetching news" });
  }
});

// Route to fetch top headlines based on constraints
newsRouter.get("/fetch-top-headlines", async (req, res) => {
  const { country, category, sources, q, pageSize, page } = req.query;

  if (
    (sources && (country || category)) ||
    (!sources && !country && !category)
  ) {
    return res.status(400).json({
      message: "You must specify either sources or a country/category.",
    });
  }

  try {
    const response = await newsapi.v2.topHeadlines({
      country: country || undefined,
      category: category || undefined,
      sources: sources || undefined,
      q: q || undefined,
      pageSize: pageSize || 20,
      page: page || 1,
    });
    res.json(response);
  } catch (error) {
    console.error("Error fetching top headlines:", error);
    res.status(500).json({ message: "Error fetching top headlines" });
  }
});

// New route to fetch sources
newsRouter.get("/fetch-sources", async (req, res) => {
  const { category, language, country } = req.query;

  try {
    const response = await newsapi.v2.sources({
      category: category || undefined,
      language: language || undefined,
      country: country || undefined,
    });
    res.json(response);
  } catch (error) {
    console.error("Error fetching sources:", error);
    res.status(500).json({ message: "Error fetching sources" });
  }
});

export default newsRouter;
