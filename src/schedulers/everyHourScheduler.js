import cron from "node-cron";
import NewsArticle from "../models/newsModel.js";
import notificationQueue from "../queues/notificationQueue.js";
import mailQueue from "../queues/mailQueue.js";
import PreferencesService from "../services/preferencesService.js";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import _ from "lodash";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import dotenv from "dotenv";
dotenv.config();

const SENDER_EMAIL = process.env.SENDER_EMAIL;

export const everyHourScheduler = () => {
  cron.schedule("0 0 * * *", async () => {
    console.info("everyHourScheduler started.");
    //fetch news articles with createdAt greater than 1 hours and limit 10
    const newsArticles = await NewsArticle.find({
      createdAt: {
        $gt: new Date(Date.now() - 60 * 60 * 1000),
      },
    }).limit(10);

    const categories = newsArticles.flatMap((article) => article.category);
    const uniqueCategories = _.uniq(categories);

    //fetch users by preferences with categories in uniqueCategories and email_frequency is "daily"

    const users = await PreferencesService.getUsersByPreferences(
      uniqueCategories,
      "hourly"
    );

    if (users.length === 0) {
      logger.info("No users found with the specified criteria.");
      return;
    }

    //filter users with notification_type is "email"
    const emailUsers = users.filter(
      (user) => user.notification_type === "email"
    );

    if (emailUsers.length === 0) {
      logger.info("No email users found with the specified criteria.");
      return;
    }

    const htmlContent = await ejs.renderFile(
      path.join(__dirname, "templates", "newsTemplate.ejs"),
      {
        newNews: newsArticles,
        unsubscribeLink: "https://your-website.com/unsubscribe",
      }
    );

    //add email to queue
    emailUsers.forEach((user) => {
      mailQueue.add(
        "mailQueue",
        {
          sender: SENDER_EMAIL,
          receiver: user.email,
          subject: "Daily News",
          htmlContent,
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    });

    // filter users with notification_type is "sms"
    const pushUsers = users.filter((user) => user.notification_type === "push");

    if (pushUsers.length === 0) {
      logger.info("No sms users found with the specified criteria.");
      return;
    }

    const notificationContent = newsArticles.map((news) => ({
      title: news.title,
      image_url: news.image_url,
      link: news.link,
    }));

    //add notification to queue
    pushUsers.forEach((user) => {
      notificationQueue.add(
        "notificationQueue",
        {
          notificationContent,
          user_id: user._id,
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    });
  });
};
