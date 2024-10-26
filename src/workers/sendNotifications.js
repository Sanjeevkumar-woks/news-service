import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import sendMail from "../utils/mail.js";
import PreferencesService from "../services/preferencesService.js";
import _ from "lodash";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendNotifications = async (newNews) => {
  const uniqueNews = _.uniqBy(newNews, "article_id");
  const limitedNews = uniqueNews.slice(0, 5);
  const newsCategories = _.uniq(limitedNews.flatMap((news) => news.category));

  console.log(newsCategories, "newsCategories from notification");

  try {
    const users = await PreferencesService.getUsersByPreferences(
      newsCategories
    );

    console.log(users.length, "users");
    if (users.length === 0) {
      console.log("No users found with the specified criteria.");
      return;
    }

    const htmlContent = await ejs.renderFile(
      path.join(__dirname, "templates", "newsTemplate.ejs"),
      {
        newNews: limitedNews,
        unsubscribeLink: "https://your-website.com/unsubscribe",
      }
    );

    const emailPromises = users.map((user) =>
      sendMail({
        sender: "sanjeevsam158@gmail.com",
        receiver: user.email,
        subject: "Your Daily News Update",
        htmlContent,
      })
    );

    await Promise.allSettled(emailPromises);
    console.log("Emails sent successfully.");
  } catch (error) {
    console.error("Error sending email notifications:", error);
  }
};

export default sendNotifications;
