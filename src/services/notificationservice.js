import Notification from "../models/notificationsModel.js";

export class NotificationService {
  static async getNotificationByUser(user_id) {
    return Notification.find(
      { user_id },
      //latest 10 notifications
      {
        sort: {
          createdAt: -1,
        },
        limit: 10,
      }
    );
  }

  static async getAllNotifications() {
    return Notification.find();
  }
}

export default NotificationService;
