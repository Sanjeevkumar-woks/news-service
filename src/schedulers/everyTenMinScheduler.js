import cron from "node-cron";
import NewsArticle from "../models/newsModel.js";
import notificationQueue from "../queues/notificationQueue.js";
import mailQueue from "../queues/mailQueue.js";
import PreferencesService from "../services/preferencesService.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import ejs from "ejs";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
import NotificationModel from "../models/notificationsModel.js";
import sendMail from "../utils/mail.js";
import _ from "lodash";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SENDER_EMAIL = process.env.SENDER_EMAIL;

export const everyTenMinScheduler = () => {
  // Schedule the cron job to run every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    console.info("everyTenMinScheduler started");

    try {
      // Fetch news articles created in the last 10 minutes, limited to 10
      const newsArticles = await NewsArticle.find({
        createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) },
      }).limit(10);

      // Check if any news articles were found
      if (newsArticles.length === 0) {
        logger.info("No new articles found in the last 10 minutes.");
        return;
      }

      // Filter out duplicate news articles by article_id and title
      const uniqueNewsArticles = _.uniqBy(newsArticles, "title");
      console.log(newsArticles.length, "news articles length");
      // Extract categories from news articles
      const categories = uniqueNewsArticles.flatMap(
        (article) => article.category
      );

      // Filter out duplicate categories
      const uniqueCategories = [...new Set(categories)];

      // Fetch users with preferences matching the categories and immediate notification
      const users = await PreferencesService.getUsersByPreferences(
        uniqueCategories,
        "immediately"
      );

      // Check if any users were found
      console.log(users.length, "users length");
      if (users.length === 0) {
        logger.info("No users found with immediate notification preferences.");
        return;
      }

      // Process email notifications
      const emailUsers = users.filter(
        (user) => user.notification_type === "email"
      );

      // Check if any email users were found
      if (emailUsers.length > 0) {
        const htmlContent = await ejs.renderFile(
          path.join(__dirname, "templates", "newsTemplate.ejs"),
          {
            newNews: uniqueNewsArticles,
            unsubscribeLink: "https://your-website.com/unsubscribe",
          }
        );

        // emailUsers.forEach((user) => {
        //   mailQueue.add(
        //     "mailQueue",
        //     {
        //       sender: SENDER_EMAIL,
        //       receiver: user.email,
        //       subject: "Latest News",
        //       htmlContent,
        //     },
        //     {
        //       removeOnComplete: true,
        //       removeOnFail: true,
        //     }
        //   );
        // });
        // logger.info(
        //   `Queued email notifications for ${emailUsers.length} users.`
        // );

        // Send email notifications
        emailUsers.forEach(async (user) => {
          sendMail({
            sender: SENDER_EMAIL,
            receiver: user.email,
            htmlContent,
            subject: "Latest News from sanjeev",
          });
        });

        logger.info(
          `Queued email notifications for ${emailUsers.length} users.`
        );
      }

      // Process push notifications
      const pushUsers = users.filter(
        (user) => user.notification_type === "push"
      );

      // Check if any push users were found and queue notifications
      if (pushUsers.length > 0) {
        const notificationContent = uniqueNewsArticles.map((news) => ({
          title: news.title,
          image_url: news.image_url,
          link: news.link,
        }));

        // pushUsers.forEach((user) => {
        //   notificationQueue.add(
        //     "notificationQueue",
        //     {
        //       notificationContent,
        //       user_id: user._id,
        //     },
        //     {
        //       removeOnComplete: true,
        //       removeOnFail: true,
        //     }
        //   );
        // });
        // send notification to all users
        pushUsers.forEach(async (user) => {
          notificationContent.forEach(async (notification) => {
            await NotificationModel.create({
              title: notification.title,
              image_url: notification.image_url,
              link: notification.link,
              user_id: user.user_id,
            });
          });
        });

        logger.info(`Queued push notifications for ${pushUsers.length} users.`);
      }
    } catch (error) {
      logger.error(`Error in everyTenMinScheduler: ${error.message}`);
    }
  });
};
