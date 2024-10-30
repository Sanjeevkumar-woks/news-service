import { Worker } from "bullmq";
import NotificationModel from "../models/notificationsModel.js";
import { getRedisClient } from "../connectors/redisConnect.js";
import logger from "../utils/logger.js";
import Joi from "joi";

const redis = getRedisClient();

export const startNotificationWorker = async () => {
  logger.info("Notification worker started");

  const notificationWorker = new Worker(
    "notificationQueue",
    async (job) => {
      logger.info(`Job ${job.id} started in notification worker`);

      const { notificationContent, user_id } = job.data;

      const notificationSchema = Joi.object({
        title: Joi.string().required(),
        image_url: Joi.string().allow(null),
        link: Joi.string().uri().required(),
      });

      let notificationsCreated = 0;

      try {
        for (const notification of notificationContent) {
          const { error } = notificationSchema.validate(notification);
          if (error) {
            logger.warn(`Invalid notification data: ${error.message}`);
            continue; // Skip this notification if validation fails
          }
          await NotificationModel.create({
            title: notification.title,
            image_url: notification.image_url,
            link: notification.link,
            user_id,
          });
          notificationsCreated++;
        }

        return {
          success: true,
          notificationsCount: notificationsCreated,
        };
      } catch (error) {
        logger.error(`Error in job ${job.id}: ${error.message}`);

        return {
          success: false,
          error: error.message,
          retryable: error.name !== "ValidationError", // Retry for non-validation errors
        };
      }
    },
    {
      connection: redis,
      backoff: {
        type: "exponential",
        delay: 1000, // Base delay in milliseconds
      },
    }
  );

  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, closing notification worker");
    await notificationWorker.close();
  });

  notificationWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} completed successfully in notification worker`);
  });

  notificationWorker.on("failed", (job, err) => {
    logger.error(`Job ${job.id} failed in notification worker: ${err.message}`);
  });
};

export default startNotificationWorker;
