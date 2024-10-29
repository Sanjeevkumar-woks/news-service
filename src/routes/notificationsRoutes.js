import Router from "express";

import * as notificationController from "../controllers/notificationController.js";

const notificationsRouter = Router();

notificationsRouter.get(
  "/get-all-notifications",
  notificationController.getAllNotifications
);
notificationsRouter.get(
  "/get-notifications-by-user/:user_id",
  notificationController.getNotificationByUser
);

export default notificationsRouter;