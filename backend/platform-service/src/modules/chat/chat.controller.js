import {
  getVendorConversation,
  sendVendorMessage,
  getAdminConversations,
  getAdminConversationMessages,
  sendAdminMessage,
} from "./chat.service.js";

const getErrorStatus = (error) => {
  if (error.statusCode) return error.statusCode;
  const msg = (error.message || "").toLowerCase();
  if (msg.includes("not found")) return 404;
  if (msg.includes("forbidden") || msg.includes("access denied")) return 403;
  if (msg.includes("already exists") || msg.includes("duplicate")) return 409;
  return 400;
};

export const getVendorConversationController = async (req, res) => {
  try {
    const result = await getVendorConversation(req.user);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve conversation",
    });
  }
};

export const sendVendorMessageController = async (req, res) => {
  try {
    const result = await sendVendorMessage(req.user, req.body.text);
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
};

export const getAdminConversationsController = async (req, res) => {
  try {
    const conversations = await getAdminConversations();
    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve conversations",
    });
  }
};

export const getAdminConversationMessagesController = async (req, res) => {
  try {
    const result = await getAdminConversationMessages(req.params.id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve conversation messages",
    });
  }
};

export const sendAdminMessageController = async (req, res) => {
  try {
    const result = await sendAdminMessage(
      req.params.id,
      req.user,
      req.body.text
    );
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = getErrorStatus(error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to send admin message",
    });
  }
};

export default {
  getVendorConversationController,
  sendVendorMessageController,
  getAdminConversationsController,
  getAdminConversationMessagesController,
  sendAdminMessageController,
};
