import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
      unique: true,
    },
    vendorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor User ID is required"],
    },
    vendorName: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    vendorEmail: {
      type: String,
      trim: true,
      default: null,
    },
    lastMessageText: {
      type: String,
      trim: true,
      default: null,
    },
    lastMessageSenderRole: {
      type: String,
      enum: ["VENDOR", "ADMIN"],
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ vendorId: 1 }, { unique: true });
conversationSchema.index({ lastMessageAt: -1 });

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation ID is required"],
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender User ID is required"],
    },
    senderRole: {
      type: String,
      enum: ["VENDOR", "ADMIN"],
      required: [true, "Sender role must be VENDOR or ADMIN"],
    },
    senderName: {
      type: String,
      required: [true, "Sender name is required"],
      trim: true,
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: [2000, "Message text cannot exceed 2000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default {
  Conversation,
  Message,
};
