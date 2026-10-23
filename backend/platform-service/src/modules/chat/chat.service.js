import mongoose from "mongoose";
import { Conversation, Message } from "./chat.model.js";
import Vendor from "../vendor/vendor.model.js";

/**
 * Retrieves the vendor's active conversation and message history.
 * If no conversation exists, returns null without creating a database record.
 */
export const getVendorConversation = async (user) => {
  const vendor = await Vendor.findOne({ userId: user.id });
  if (!vendor) {
    const err = new Error("Vendor profile not found for authenticated user");
    err.statusCode = 404;
    throw err;
  }

  const conversation = await Conversation.findOne({ vendorId: vendor._id });
  if (!conversation) {
    return {
      conversation: null,
      messages: [],
    };
  }

  const messages = await Message.find({ conversationId: conversation._id }).sort({
    createdAt: 1,
  });

  return {
    conversation,
    messages,
  };
};

/**
 * Sends a message from the authenticated vendor.
 * Safely creates the conversation on first message with concurrency protection.
 */
export const sendVendorMessage = async (user, text) => {
  const trimmedText = (text || "").trim();
  if (!trimmedText) {
    const err = new Error("Message text cannot be empty");
    err.statusCode = 400;
    throw err;
  }
  if (trimmedText.length > 2000) {
    const err = new Error("Message text cannot exceed 2000 characters");
    err.statusCode = 400;
    throw err;
  }

  const vendor = await Vendor.findOne({ userId: user.id });
  if (!vendor) {
    const err = new Error("Vendor profile not found for authenticated user");
    err.statusCode = 404;
    throw err;
  }

  // Find or create conversation with duplicate key collision handling (E11000)
  let conversation = await Conversation.findOne({ vendorId: vendor._id });
  if (!conversation) {
    try {
      conversation = await Conversation.create({
        vendorId: vendor._id,
        vendorUserId: vendor.userId || user.id,
        vendorName: vendor.companyName || vendor.contactName || user.name || "Vendor Partner",
        vendorEmail: user.email || null,
        lastMessageText: trimmedText,
        lastMessageSenderRole: "VENDOR",
        lastMessageAt: new Date(),
      });
    } catch (createErr) {
      if (createErr.code === 11000) {
        conversation = await Conversation.findOne({ vendorId: vendor._id });
      } else {
        throw createErr;
      }
    }
  }

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: user.id,
    senderRole: "VENDOR",
    senderName: user.name || vendor.contactName || "Vendor",
    text: trimmedText,
  });

  conversation.lastMessageText = trimmedText;
  conversation.lastMessageSenderRole = "VENDOR";
  conversation.lastMessageAt = message.createdAt || new Date();
  await conversation.save();

  return {
    conversation,
    message,
  };
};

/**
 * Lists all vendor conversations for the Admin interface.
 */
export const getAdminConversations = async () => {
  const conversations = await Conversation.find()
    .populate("vendorId", "companyName contactName location rating status initials avatarBg")
    .sort({ lastMessageAt: -1, updatedAt: -1 });

  return conversations;
};

/**
 * Retrieves a specific conversation's message history for Admin.
 */
export const getAdminConversationMessages = async (conversationId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    const err = new Error("Invalid conversation ID format");
    err.statusCode = 400;
    throw err;
  }

  const conversation = await Conversation.findById(conversationId).populate(
    "vendorId",
    "companyName contactName location rating status initials avatarBg"
  );

  if (!conversation) {
    const err = new Error("Conversation not found");
    err.statusCode = 404;
    throw err;
  }

  const messages = await Message.find({ conversationId: conversation._id }).sort({
    createdAt: 1,
  });

  return {
    conversation,
    messages,
  };
};

/**
 * Sends a reply message from an Admin to a specific vendor conversation.
 */
export const sendAdminMessage = async (conversationId, user, text) => {
  const trimmedText = (text || "").trim();
  if (!trimmedText) {
    const err = new Error("Message text cannot be empty");
    err.statusCode = 400;
    throw err;
  }
  if (trimmedText.length > 2000) {
    const err = new Error("Message text cannot exceed 2000 characters");
    err.statusCode = 400;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    const err = new Error("Invalid conversation ID format");
    err.statusCode = 400;
    throw err;
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const err = new Error("Conversation not found");
    err.statusCode = 404;
    throw err;
  }

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: user.id,
    senderRole: "ADMIN",
    senderName: user.name || "Admin Support",
    text: trimmedText,
  });

  conversation.lastMessageText = trimmedText;
  conversation.lastMessageSenderRole = "ADMIN";
  conversation.lastMessageAt = message.createdAt || new Date();
  await conversation.save();

  return {
    conversation,
    message,
  };
};

export default {
  getVendorConversation,
  sendVendorMessage,
  getAdminConversations,
  getAdminConversationMessages,
  sendAdminMessage,
};
