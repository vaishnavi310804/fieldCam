import platformApi from "./api";

/**
 * Vendor: Retrieves the vendor's existing conversation and messages.
 */
export const getVendorConversation = async () => {
  const response = await platformApi.get("/chat/vendor/conversation");
  return response.data;
};

/**
 * Vendor: Sends a message (and safely creates the conversation if first message).
 */
export const sendVendorMessage = async (text) => {
  const response = await platformApi.post("/chat/vendor/messages", { text });
  return response.data;
};

/**
 * Admin: Lists all vendor conversations.
 */
export const getAdminConversations = async () => {
  const response = await platformApi.get("/chat/admin/conversations");
  return response.data;
};

/**
 * Admin: Retrieves messages for a specific conversation.
 */
export const getAdminConversationMessages = async (conversationId) => {
  const response = await platformApi.get(
    `/chat/admin/conversations/${conversationId}/messages`
  );
  return response.data;
};

/**
 * Admin: Sends an admin reply to a specific conversation.
 */
export const sendAdminMessage = async (conversationId, text) => {
  const response = await platformApi.post(
    `/chat/admin/conversations/${conversationId}/messages`,
    { text }
  );
  return response.data;
};

export default {
  getVendorConversation,
  sendVendorMessage,
  getAdminConversations,
  getAdminConversationMessages,
  sendAdminMessage,
};
