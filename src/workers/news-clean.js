import cron from "node-cron";
import OldNewsArticle from "../models/oldNewsModel.js";
import NewsArticle from "../models/newsModel.js";

//function that moves the news articles older than 24 hours to the oldNews collection and deletes them from the news collection
const startNewsBackupCron = () => {
  cron.schedule("* * * * *", async () => {
    await OldNewsArticle.insertMany(await NewsArticle.find());
    await NewsArticle.deleteMany({});
  });
};

export default startNewsBackupCron;
