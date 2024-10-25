import sendMail from "./mail.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
// ... existing imports ...

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const emailNotification = async (newNews) => {
  //limit number of news articles to 5
  const limitedNews = newNews.slice(0, 5);

  const htmlContent = await ejs.renderFile(
    path.join(__dirname, "templates", "newsTemplate.ejs"),
    {
      newNews: limitedNews,
      unsubscribeLink: "https://your-website.com/unsubscribe",
    }
  );

  await sendMail({
    sender: "sanjeevsam158@gmail.com",
    receiver: "sanjeevmanagutti@gmail.com",
    htmlContent: htmlContent,
  });
  console.log("Email sent successfully from notification");
};

export default emailNotification;
