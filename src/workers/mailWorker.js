import { Worker } from "bullmq";
import sendMail from "../utils/mail.js";
import logger from "../utils/logger.js";
import { getRedisClient } from "../connectors/redisConnect.js";

const redis = getRedisClient();

const startMailWorker = async () => {
  const mailWorker = new Worker(
    "mailQueue",
    async (job) => {
      logger.info(`Mail job ${job.id} started.`);

      const { sender, receiver, subject, htmlContent } = job.data;

      try {
        await sendMail({ sender, receiver, subject, htmlContent });
        logger.info(`Mail sent successfully for job ${job.id} to ${receiver}`);
        return { success: true, mailCount: 1 };
      } catch (error) {
        logger.error(`Error in job ${job.id}: ${error.message}`);

        // Define retryability based on error type
        const isRetryable = error.name !== "ValidationError";
        if (!isRetryable) {
          logger.info(`Validation error in job ${job.id}, skipping retry.`);
        }

        return { success: false, error: error.message, retryable: isRetryable };
      }
    },
    {
      connection: redis,
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    }
  );

  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, closing mail worker.");
    try {
      await mailWorker.close();
      logger.info("Mail worker closed gracefully.");
    } catch (error) {
      logger.error(`Error closing mail worker: ${error.message}`);
    }
  });

  mailWorker.on("completed", (job) => {
    logger.info(`Mail job ${job.id} completed successfully.`);
  });

  mailWorker.on("failed", (job, err) => {
    logger.error(`Mail job ${job.id} failed: ${err.message}`);
  });
};

export default startMailWorker;
