import Notification from "../models/notificationsModel";

const getAllNotifications = async (req, res) => {
  const notifications = await Notification.find();
  res.status(200).json(notifications);
};

const getNotificationByUser = async (req, res) => {
  const { user_id } = req.params;
  const notifications = NotificationServer.getNotificationByUser(user_id);
  res.status(200).json(notifications);
};

export default { getAllNotifications, getNotificationByUser };
