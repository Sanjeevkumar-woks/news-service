import { Worker } from "bullmq";
import NotificationModel from "../models/notificationsModel.js";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
import Joi from "joi";

dotenv.config();

const redis = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

export const startNotificationWorker = async () => {
  logger.info("Notification worker started");

  const notificationWorker = new Worker(
    "notificationQueue",
    async (job) => {
      logger.info(`Job ${job.id} started notification worker`);

      const { notificationContent, user_id } = job.data;

      //notificationContent is array of objects

      const notificationSchema = Joi.object({
        title: Joi.string().required(),
        image_url: Joi.string().allow(null),
        link: Joi.string().uri().required(),
      });

      try {
        notificationContent.forEach(async (notification) => {
          const { error } = notificationSchema.validate(notification);
          if (error) {
            throw new Error(`Invalid notification data: ${error.message}`);
          }
          await NotificationModel.create({
            title: notification.title,
            image_url: notification.image_url,
            link: notification.link,
            user_id,
          });
        });
        return {
          success: true,
          notificationsCount: notificationContent.length,
        };
      } catch (error) {
        logger.error(
          `Error in job ${job.id}: ${error.message} ,"Error in notification worker"`
        );
        if (error.name === "ValidationError") {
          logger.info("validation error in notification worker");
          // Handle data validation errors
          return {
            success: false,
            error: "Data validation error",
            retryable: false,
          };
        }
        // Handle other types of errors
        return { success: false, error: error.message, retryable: true };
      }
    },
    { connection: redis, backoffStrategies: { exponential: true } }
  );

  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, closing worker");
    await notificationWorker.close();
  });

  notificationWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} notification-worker completed`);
  });

  notificationWorker.on("failed", (job, err) => {
    logger.error(`Job ${job.id} notification-worker failed: ${err.message}`);
  });

  logger.info("Notification worker stopped");
};

export default startNotificationWorker;
