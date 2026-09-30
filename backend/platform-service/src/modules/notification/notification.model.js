import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "./notification.constant.js";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    body: {
      type: String,
      required: [true, "Notification body is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: {
        values: NOTIFICATION_TYPES,
        message: "{VALUE} is not a valid notification type",
      },
      default: "SYSTEM",
    },
    data: {
      type: Object,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to optimize fetching user notifications sorted by creation date
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
