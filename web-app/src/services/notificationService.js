import platformApi from "./api";

export const getNotifications = async () => {
  const response = await platformApi.get("/notifications");
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await platformApi.get("/notifications/unread-count");
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await platformApi.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await platformApi.patch("/notifications/read-all");
  return response.data;
};

