import platformApi from "./api";

/**
 * Fetch all notifications for the authenticated user.
 * GET /api/notifications
 */
export const getNotifications = async () => {
  const response = await platformApi.get("/notifications");
  return response.data;
};

/**
 * Fetch unread notification count for the authenticated user.
 * GET /api/notifications/unread-count
 */
export const getUnreadNotificationCount = async () => {
  const response = await platformApi.get("/notifications/unread-count");
  return response.data;
};

/**
 * Mark a single notification as read for the authenticated user.
 * PATCH /api/notifications/:id/read
 */
export const markNotificationAsRead = async (notificationId) => {
  const response = await platformApi.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Mark all notifications as read for the authenticated user.
 * PATCH /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async () => {
  const response = await platformApi.patch("/notifications/read-all");
  return response.data;
};
