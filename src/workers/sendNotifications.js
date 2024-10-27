import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import PreferencesService from "../services/preferencesService.js";
import _ from "lodash";
import notificationQueue from "../queues/notificationQueue.js";
import mailQueue from "../queues/mailQueue.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config();

const SENDER_EMAIL = process.env.SENDER_EMAIL;
const NEWS_LIMIT = process.env.NEWS_LIMIT;

export const sendNotifications = async (newNews) => {
  const uniqueNews = _.uniqBy(newNews, "article_id");
  const limitedNews = uniqueNews.slice(0, NEWS_LIMIT);
  const newsCategories = _.uniq(limitedNews.flatMap((news) => news.category));

  logger.info(newsCategories, "newsCategories from notification");

  try {
    const users = await PreferencesService.getUsersByPreferences(
      newsCategories
    );

    logger.info(users.length, "users");
    if (users.length === 0) {
      logger.info("No users found with the specified criteria.");
      return;
    }

    const htmlContent = await ejs.renderFile(
      path.join(__dirname, "templates", "newsTemplate.ejs"),
      {
        newNews: limitedNews,
        unsubscribeLink: "https://your-website.com/unsubscribe",
      }
    );

    const notificationContent = limitedNews.map((news) => ({
      title: news.title,
      image_url: news.image_url,
      link: news.link,
    }));

    const notificationPromises = users.map(async (user) => {
      try {
        await notificationQueue.add("notificationQueue", {
          notificationContent,
          user_id: user.user_id,
        });

        await mailQueue.add("mailQueue", {
          sender: SENDER_EMAIL,
          receiver: user.email,
          subject: "Your Daily News Update",
          htmlContent,
        });
      } catch (error) {
        logger.error(
          `Error sending notifications to users ${user.email}: ${error}`
        );
      }
    });

    await Promise.allSettled(notificationPromises);

    logger.info("All notifications sent successfully");
  } catch (error) {
    logger.error("Error sending email notifications:", error);
  }
};

export default sendNotifications;
