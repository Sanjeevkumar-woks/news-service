import mongoose from "mongoose";

const notificationLogsSchema = new mongoose.Schema({});

const NotificationLogs = mongoose.model(
  "NotificationLogs",
  notificationLogsSchema
);

export default NotificationLogs;
