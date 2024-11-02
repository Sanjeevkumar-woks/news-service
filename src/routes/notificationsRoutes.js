import Router from "express";
import * as notificationController from "../controllers/notificationController.js";

const notificationsRouter = Router();

//get all notifications
notificationsRouter.get(
  "/get-all-notifications",
  notificationController.getAllNotifications
);

//get notifications by user
notificationsRouter.get(
  "/get-notifications-by-user/:user_id",
  notificationController.getNotificationByUser
);

export default notificationsRouter;
