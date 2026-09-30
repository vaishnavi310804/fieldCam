import { Router } from "express";
import { protect } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import { markReadValidation } from "./notification.validation.js";
import {
  getUserNotificationsController,
  getUnreadCountController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from "./notification.controller.js";
import {
  registerDeviceTokenValidation,
  unregisterDeviceTokenValidation,
} from "./deviceToken.validation.js";
import {
  registerDeviceTokenController,
  unregisterDeviceTokenController,
} from "./deviceToken.controller.js";

const router = Router();

// Protect all notification routes with authenticated user identity
router.use(protect);

// GET /api/notifications - Get all notifications for authenticated user
router.get("/", getUserNotificationsController);

// GET /api/notifications/unread-count - Get unread count for authenticated user
router.get("/unread-count", getUnreadCountController);

// PATCH /api/notifications/read-all - Mark all notifications as read for authenticated user
router.patch("/read-all", markAllNotificationsAsReadController);

// PATCH /api/notifications/:id/read - Mark a single notification as read
router.patch("/:id/read", markReadValidation, validate, markNotificationAsReadController);

// POST /api/notifications/device-token - Register or update FCM device token
router.post("/device-token", registerDeviceTokenValidation, validate, registerDeviceTokenController);

// DELETE /api/notifications/device-token - Deactivate FCM device token
router.delete("/device-token", unregisterDeviceTokenValidation, validate, unregisterDeviceTokenController);

export default router;
