import { Worker } from "bullmq";
import sendMail from "../utils/mail.js";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

const redis = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

const startMailWorker = async () => {
  const mailWorker = new Worker(
    "mailQueue",
    async (job) => {
      logger.info(`Job ${job.id} mail-worker started`);
      const { sender, receiver, subject, htmlContent } = job.data;

      try {
        await sendMail({ sender, receiver, subject, htmlContent });
        return { success: true, mailCount: 1 };
      } catch (error) {
        logger.error(
          `Error in job ${job.id}: ${error.message},"Error in Mail worker"`
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
    await mailWorker.close();
  });

  mailWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} mail-worker completed`);
  });

  mailWorker.on("failed", (job, err) => {
    logger.error(`Job ${job.id} mail-worker failed: ${err.message}`);
  });
};

export default startMailWorker;
