import Notification from "../models/notificationsModel.js";
import NotificationService from "../services/notificationService.js";

const getAllNotifications = async (req, res) => {
  const notifications = await Notification.find();
  res.status(200).json(notifications);
};

const getNotificationByUser = async (req, res) => {
  console.log("getNotificationByUser");

  const { user_id } = req.params;
  console.log(user_id);
  const notifications = await NotificationService.getNotificationByUser(
    user_id
  );
  res.status(200).json(notifications);
};

export { getAllNotifications, getNotificationByUser };
