import Notification from "../models/notificationsModel.js";
import NotificationService from "../services/notificationService.js";

//get all notifications
const getAllNotifications = async (req, res) => {
  const notifications = await Notification.find();
  res.status(200).json(notifications);
};

//get notifications by user
const getNotificationByUser = async (req, res) => {
  console.log("getNotificationByUser");

  const { user_id } = req.params;

  const notifications = await NotificationService.getNotificationByUser(
    user_id
  );
  res.status(200).json(notifications);
};

export { getAllNotifications, getNotificationByUser };
