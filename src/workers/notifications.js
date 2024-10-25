import sendMail from "./mail.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import _ from "lodash";
import Preferences from "../models/preferences.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const emailNotification = async (newNews) => {
  // Limit the number of news articles to the first 5 unique articles
  const uniqueNews = _.uniqBy(newNews, "article_id");
  const limitedNews = uniqueNews.slice(0, 5);

  // Extract all categories from the news articles
  const newsCategories = _.uniq(limitedNews.flatMap((news) => news.category));

  console.log(newsCategories, "newsCategories");
  try {
    // Get users whose preferences match any of the categories in the news and have daily email frequency
    const users = await Preferences.aggregate([
      {
        $match: {
          categories: { $in: newsCategories },
          email_frequency: "immediately",
        },
      },
      {
        // Convert `user_id` to `ObjectId` for matching with `_id` in `users`
        $addFields: {
          userId: { $toObjectId: "$user_id" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        // Unwind the userDetails to make it a single object instead of an array
        $unwind: "$userDetails",
      },
      {
        $match: {
          "userDetails.is_active": true,
        },
      },
      {
        $project: {
          email: "$userDetails.email",
          username: "$userDetails.username",
        },
      },
    ]);

    console.log(users, "users");

    if (users.length === 0) {
      console.log("No users found with the specified criteria.");
      return;
    }
    // Render the HTML content for the email using EJS
    const htmlContent = await ejs.renderFile(
      path.join(__dirname, "templates", "newsTemplate.ejs"),
      {
        newNews: limitedNews,
        unsubscribeLink: "https://your-website.com/unsubscribe",
      }
    );

    // Send emails to all users whose preferences match the news categories
    const emailPromises = users.map((user) =>
      sendMail({
        sender: "sanjeevsam158@gmail.com",
        receiver: user.email,
        subject: "Your Daily News Update",
        htmlContent: htmlContent,
      })
    );

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    console.log("Emails sent successfully to all matching users.");
  } catch (error) {
    console.error("Error sending email notifications:", error);
  }
};

export default emailNotification;
