import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./notification.service.js";

export const getUserNotificationsController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const notifications = await getUserNotifications(userId);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch notifications",
    });
  }
};

export const getUnreadCountController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const unreadCount = await getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch unread notification count",
    });
  }
};

export const markNotificationAsReadController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    const notification = await markNotificationAsRead(notificationId, userId);

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    const isNotFound =
      error.message?.includes("not found") ||
      error.message?.includes("access denied");
    const statusCode = isNotFound ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to mark notification as read",
    });
  }
};

export const markAllNotificationsAsReadController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await markAllNotificationsAsRead(userId);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to mark all notifications as read",
    });
  }
};
