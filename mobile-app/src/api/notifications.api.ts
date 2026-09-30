import { platformClient } from "./platformClient";

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const notificationsApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await platformClient.get("/notifications");
    return response.data?.data || [];
  },

  getUnreadNotificationCount: async (): Promise<number> => {
    const response = await platformClient.get("/notifications/unread-count");
    return response.data?.data?.unreadCount || 0;
  },

  markNotificationAsRead: async (
    notificationId: string
  ): Promise<NotificationItem> => {
    const response = await platformClient.patch(
      `/notifications/${notificationId}/read`
    );
    return response.data?.data;
  },

  markAllNotificationsAsRead: async (): Promise<{ modifiedCount: number }> => {
    const response = await platformClient.patch("/notifications/read-all");
    return response.data?.data || { modifiedCount: 0 };
  },
};
