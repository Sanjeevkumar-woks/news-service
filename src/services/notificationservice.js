export class NotificationService {
  static async getNotificationByUser(user_id) {
    return Notification.find(
      { user_id },
      //last 10 notifications
      {
        sort: { createdAt: -1 },
        limit: 10,
      }
    );
  }

  static async getAllNotifications() {
    return Notification.find();
  }
}
