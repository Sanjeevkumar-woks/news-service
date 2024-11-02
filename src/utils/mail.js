import nodeMailer from "nodemailer";
import logger from "./logger.js";

// Send mail with nodemailer and sendgrid SMTP
const sendMail = ({ sender, receiver, htmlContent, subject }) => {
  const transporter = nodeMailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: sender,
    to: receiver,
    subject: subject || "New News Articles",
    html: htmlContent,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error(error);
    } else {
      logger.info("Email sent: " + info.response);
    }
  });
};

export default sendMail;
