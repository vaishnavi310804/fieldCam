import { platformClient } from "./platformClient";

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: "VENDOR" | "ADMIN";
  senderName: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatConversation {
  _id: string;
  vendorId: string;
  vendorUserId: string;
  vendorName: string;
  vendorEmail?: string | null;
  lastMessageText?: string | null;
  lastMessageSenderRole?: "VENDOR" | "ADMIN" | null;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GetConversationResponse {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  conversation: ChatConversation;
  message: ChatMessage;
}

export const getVendorConversation = async (): Promise<GetConversationResponse> => {
  const response = await platformClient.get<{
    success: boolean;
    data: GetConversationResponse;
    message?: string;
  }>("/chat/vendor/conversation");

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch live chat conversation");
  }

  return response.data.data;
};

export const sendVendorMessage = async (
  text: string
): Promise<SendMessageResponse> => {
  const response = await platformClient.post<{
    success: boolean;
    data: SendMessageResponse;
    message?: string;
  }>("/chat/vendor/messages", { text });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to send message");
  }

  return response.data.data;
};

export const chatApi = {
  getVendorConversation,
  sendVendorMessage,
};

export default chatApi;
