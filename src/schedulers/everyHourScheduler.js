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
import NotificationModel from "../models/notificationsModel.js";
import sendMail from "../utils/mail.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SENDER_EMAIL = process.env.SENDER_EMAIL;

export const everyHourScheduler = () => {
  // Schedule the cron job to run every hour
  cron.schedule("0 * * * *", async () => {
    logger.info("everyHourScheduler started.");

    try {
      // Fetch news articles created in the last hour, limited to 10
      const newsArticles = await NewsArticle.find({
        createdAt: {
          $gt: new Date(Date.now() - 60 * 60 * 1000),
        },
      }).limit(10);

      if (newsArticles.length === 0) {
        logger.info("No new articles found in the last hour.");
        return;
      }
      // filter out duplicate articles by article_id and title
      const uniqueNewsArticles = _.uniqBy(newsArticles, "title");

      // Extract categories from news articles
      const categories = uniqueNewsArticles.flatMap(
        (article) => article.category
      );

      //
      const uniqueCategories = _.uniq(categories);

      // Fetch users with preferences matching the categories and hourly notification frequency
      const users = await PreferencesService.getUsersByPreferences(
        uniqueCategories,
        "hourly"
      );

      // Check if no users are found
      if (users.length === 0) {
        logger.info("No users found with hourly notification preferences.");
        return;
      }

      // filter users by email notification type
      const emailUsers = users.filter(
        (user) => user.notification_type === "email"
      );

      //
      if (emailUsers.length > 0) {
        // Render email template
        const htmlContent = await ejs.renderFile(
          path.join(__dirname, "templates", "newsTemplate.ejs"),
          {
            newNews: uniqueNewsArticles,
            unsubscribeLink: "https://your-website.com/unsubscribe",
          }
        );

        // add to mail queue

        //   emailUsers.forEach((user) => {
        //     mailQueue.add(
        //       "mailQueue",
        //       {
        //         sender: SENDER_EMAIL,
        //         receiver: user.email,
        //         subject: "Hourly News",
        //         htmlContent,
        //       },
        //       {
        //         removeOnComplete: true,
        //         removeOnFail: true,
        //       }
        //     );
        //   });
        //   logger.info(
        //     `Queued email notifications for ${emailUsers.length} users.`
        //   );

        // send email
        emailUsers.forEach(async (user) => {
          sendMail({
            sender: SENDER_EMAIL,
            receiver: user.email,
            htmlContent,
            subject: "Hourly News",
          });
        });

        logger.info(`Email notifications sent to ${emailUsers.length} users.`);
      }

      // Process push notifications
      const pushUsers = users.filter(
        (user) => user.notification_type === "push"
      );

      // check if push users exist
      if (pushUsers.length > 0) {
        const notificationContent = uniqueNewsArticles.map((news) => ({
          title: news.title,
          image_url: news.image_url,
          link: news.link,
        }));

        //pushUsers.forEach((user) => {
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
        // logger.info(`Queued push notifications for ${pushUsers.length} users.`);
        //}

        // send push notifications
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
      }
    } catch (error) {
      // log error
      logger.error(`Error in everyHourScheduler: ${error.message}`);
    }
  });
};
