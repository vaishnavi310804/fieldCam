import mongoose from "mongoose";
import Notification from "./notification.model.js";
import { sendPushNotificationForUser } from "./push.service.js";

export const createNotification = async ({
  userId,
  title,
  body,
  type = "SYSTEM",
  data = {},
}) => {
  if (!userId) {
    throw new Error("Recipient user ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID format for notification recipient");
  }

  if (!title || !title.trim()) {
    throw new Error("Notification title is required");
  }

  if (!body || !body.trim()) {
    throw new Error("Notification body is required");
  }

  const notification = await Notification.create({
    userId,
    title: title.trim(),
    body: body.trim(),
    type,
    data,
    isRead: false,
    readAt: null,
  });

  // Attempt FCM Push Delivery asynchronously without blocking persistent notification or caller
  sendPushNotificationForUser({
    userId,
    title: title.trim(),
    body: body.trim(),
    type,
    data,
  }).catch((err) => {
    console.warn("[FCM Push] Background delivery handler caught error:", err.message);
  });

  return notification;
};

export const getUserNotifications = async (userId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid or missing user identity");
  }

  const notifications = await Notification.find({ userId }).sort({
    createdAt: -1,
  });

  return notifications;
};

export const getUnreadCount = async (userId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid or missing user identity");
  }

  const count = await Notification.countDocuments({
    userId,
    isRead: false,
  });

  return count;
};

export const markNotificationAsRead = async (notificationId, userId) => {
  if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new Error("Invalid notification ID format");
  }

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid or missing user identity");
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    userId,
  });

  if (!notification) {
    throw new Error("Notification not found or access denied");
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return notification;
};


export const markAllNotificationsAsRead = async (userId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid or missing user identity");
  }

  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return {
    modifiedCount: result.modifiedCount || 0,
  };
};
