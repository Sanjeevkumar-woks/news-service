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
import dotenv from "dotenv";
import sendMail from "../utils/mail.js";
import NotificationModel from "../models/notificationsModel.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SENDER_EMAIL = process.env.SENDER_EMAIL;

export const everyDayScheduler = () => {
  cron.schedule("0 0 * * *", async () => {
    logger.info("everyDayScheduler started.");

    try {
      // Fetch news articles created in the last 24 hours, limited to 10
      const newsArticles = await NewsArticle.find({
        createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }).limit(10);

      // Check if any news articles were found
      if (newsArticles.length === 0) {
        logger.info("No new articles found in the last 24 hours.");
        return;
      }

      //filer out duplicate news articles by article_id and title
      const uniqueNewsArticles = _.uniqBy(newsArticles, "title");

      // Extract categories from news articles
      const categories = uniqueNewsArticles.flatMap(
        (article) => article.category
      );

      // Filter out duplicate categories
      const uniqueCategories = _.uniq(categories);

      // Fetch users with daily notification preference in specified categories
      const users = await PreferencesService.getUsersByPreferences(
        uniqueCategories,
        "daily"
      );

      // Check if any users were found
      if (users.length === 0) {
        logger.info("No users found with daily notification preferences.");
        return;
      }

      // Process email notifications
      const emailUsers = users.filter(
        (user) => user.notification_type === "email"
      );

      // Render email template
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
        //       subject: "Daily News",
        //       htmlContent,
        //     },
        //     {
        //       removeOnComplete: true,
        //       removeOnFail: true,
        //     }
        //   );
        // });

        // Send email
        emailUsers.forEach(async (user) => {
          sendMail({
            sender: SENDER_EMAIL,
            receiver: user.email,
            htmlContent,
            subject: "Daily News",
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

      // Render push template
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

        // Send push notifications
        pushUsers.forEach(async (user) => {
          notificationContent.forEach((notification) => {
            NotificationModel.create({
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
      logger.error(`Error in everyDayScheduler: ${error.message}`);
    }
  });
};
