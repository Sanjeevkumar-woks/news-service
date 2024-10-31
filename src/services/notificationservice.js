import Notification from "../models/notificationsModel.js";
import userModel from "../models/userModel.js";

export default class NotificationService {
  static async getNotificationByUser(user_id) {
    const user = await userModel.findById({ _id: user_id });
    if (!user) {
      return [];
    }
    return Notification.find(
      { user_id },
      { viewed: false },
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
