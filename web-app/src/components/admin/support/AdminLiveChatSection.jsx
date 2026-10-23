import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiMessageSquare,
  FiSend,
  FiLoader,
  FiAlertCircle,
  FiUser,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import {
  getAdminConversations,
  getAdminConversationMessages,
  sendAdminMessage,
} from "../../../services/chatService";

const AdminLiveChatSection = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState("");

  const isFetchingListRef = useRef(false);
  const isFetchingMessagesRef = useRef(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fetch conversations list
  const fetchConversationsList = useCallback(async (isInitial = false) => {
    if (isFetchingListRef.current) return;
    isFetchingListRef.current = true;

    try {
      if (isInitial) setLoadingList(true);
      const res = await getAdminConversations();
      const list = res?.data || res || [];
      setConversations(Array.isArray(list) ? list : []);

      // Auto-select first conversation on initial load if none selected
      setSelectedConvId((current) => {
        if (!current && list.length > 0) {
          return list[0]._id;
        }
        return current;
      });
    } catch (err) {
      if (isInitial) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load vendor conversations"
        );
      }
    } finally {
      if (isInitial) setLoadingList(false);
      isFetchingListRef.current = false;
    }
  }, []);

  // 2. Fetch messages for selected conversation
  const fetchMessagesForSelected = useCallback(
    async (convId, isInitial = false) => {
      if (!convId || isFetchingMessagesRef.current) return;
      isFetchingMessagesRef.current = true;

      try {
        if (isInitial) setLoadingMessages(true);
        const res = await getAdminConversationMessages(convId);
        const data = res?.data || res || {};

        setSelectedConversation(data.conversation || null);

        if (Array.isArray(data.messages)) {
          setMessages((prev) => {
            const map = new Map();
            prev.forEach((m) => map.set(m._id, m));
            data.messages.forEach((m) => map.set(m._id, m));
            return Array.from(map.values()).sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
          });
        }
      } catch (err) {
        if (isInitial) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load messages for conversation"
          );
        }
      } finally {
        if (isInitial) setLoadingMessages(false);
        isFetchingMessagesRef.current = false;
      }
    },
    []
  );

  // Initial load & polling for conversations list (every 4 seconds)
  useEffect(() => {
    fetchConversationsList(true);

    const interval = setInterval(() => {
      fetchConversationsList(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchConversationsList]);

  // Initial load & polling for selected conversation messages (every 3.5 seconds)
  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      setSelectedConversation(null);
      return;
    }

    setMessages([]);
    fetchMessagesForSelected(selectedConvId, true);

    const interval = setInterval(() => {
      fetchMessagesForSelected(selectedConvId, false);
    }, 3500);

    return () => clearInterval(interval);
  }, [selectedConvId, fetchMessagesForSelected]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    const text = replyText.trim();
    if (!text || !selectedConvId || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await sendAdminMessage(selectedConvId, text);
      const data = res?.data || res;

      if (data?.message) {
        setMessages((prev) => [...prev, data.message]);
      }
      if (data?.conversation) {
        setSelectedConversation(data.conversation);
      }

      setReplyText("");
      // Refresh list to update lastMessageAt
      fetchConversationsList(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to send reply. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl shadow-xs overflow-hidden flex flex-col md:flex-row h-[650px]">
      {/* LEFT COLUMN: Vendor Conversations List */}
      <div className="w-full md:w-80 border-r border-[#E8E2DE] flex flex-col shrink-0 bg-[#FAF7F5]">
        {/* List Header */}
        <div className="p-4 border-b border-[#E8E2DE] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#3E3734]">Vendor Chats</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EAE4DF] text-[#5D4037]">
              {conversations.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => fetchConversationsList(true)}
            className="p-1.5 text-[#817B77] hover:text-[#3E3734] rounded-lg transition-colors cursor-pointer"
            title="Refresh List"
          >
            <FiRefreshCw size={13} className={loadingList ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#EAE4DF]/60">
          {loadingList ? (
            <div className="p-8 text-center text-xs text-[#817B77] flex flex-col items-center gap-2">
              <FiLoader className="animate-spin text-base text-[#C87A65]" />
              <span>Loading conversations...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#817B77] space-y-1">
              <FiMessageSquare className="mx-auto text-xl text-[#A8A29E] mb-2" />
              <p className="font-bold text-[#3E3734]">No conversations yet</p>
              <p className="text-[11px]">When a vendor sends a live chat message, it will appear here.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedConvId === conv._id;
              const vendor = conv.vendorId || {};
              const displayName =
                vendor.companyName || conv.vendorName || "Vendor Partner";
              const contactName = vendor.contactName || "";
              const initials =
                vendor.initials ||
                displayName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

              return (
                <div
                  key={conv._id}
                  onClick={() => setSelectedConvId(conv._id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white border-l-4 border-[#C87A65] shadow-2xs"
                      : "hover:bg-[#F2ECE8]"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Initials Avatar */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0"
                      style={{ backgroundColor: vendor.avatarBg || "#8D6E63" }}
                    >
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1">
                        <h4 className="text-xs font-bold text-[#3E3734] truncate">
                          {displayName}
                        </h4>
                        <span className="text-[10px] text-[#A8A29E] shrink-0 font-medium">
                          {formatTime(conv.lastMessageAt) || formatDate(conv.updatedAt)}
                        </span>
                      </div>

                      {contactName && (
                        <p className="text-[10px] text-[#817B77] truncate">
                          {contactName}
                        </p>
                      )}

                      <p className="text-[11px] text-[#6E6763] truncate mt-0.5 font-medium">
                        {conv.lastMessageSenderRole === "ADMIN" ? (
                          <span className="font-bold text-[#C87A65]">You: </span>
                        ) : null}
                        {conv.lastMessageText || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Conversation & Reply */}
      <div className="flex-1 flex flex-col bg-[#FAF8F6] min-w-0">
        {!selectedConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#817B77] space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#E8E2DE] text-[#3E3734] flex items-center justify-center text-xl shadow-2xs">
              <FiMessageSquare />
            </div>
            <h3 className="text-sm font-bold text-[#3E3734]">
              Select a conversation
            </h3>
            <p className="text-xs max-w-xs">
              Choose a vendor conversation from the left panel to read message history and reply.
            </p>
          </div>
        ) : (
          <>
            {/* Conversation Header */}
            <div className="p-3.5 px-5 border-b border-[#E8E2DE] bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#3E3734] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <FiUser />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#3E3734]">
                    {selectedConversation?.vendorName ||
                      selectedConversation?.vendorId?.companyName ||
                      "Vendor Partner"}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-[#817B77]">
                    {selectedConversation?.vendorEmail && (
                      <span>{selectedConversation.vendorEmail}</span>
                    )}
                    {selectedConversation?.vendorId?.location && (
                      <>
                        <span>•</span>
                        <span>{selectedConversation.vendorId.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                  Live Support
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-[#FFEBEE] border-b border-[#C62828]/20 text-[#C62828] px-4 py-2 text-xs font-semibold flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="text-sm shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-[#C62828] text-[11px] font-bold hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {loadingMessages ? (
                <div className="h-full flex flex-col items-center justify-center text-[#817B77] space-y-2">
                  <FiLoader className="text-2xl animate-spin text-[#C87A65]" />
                  <p className="text-xs">Loading message history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#817B77]">
                  <p className="text-xs font-medium">No messages in this conversation yet.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.senderRole === "ADMIN";
                  return (
                    <div
                      key={msg._id || `${msg.createdAt}-${msg.senderRole}`}
                      className={`flex flex-col ${
                        isAdmin ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-baseline gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-[#817B77]">
                          {isAdmin ? "You (Admin)" : msg.senderName || "Vendor"}
                        </span>
                        <span className="text-[9px] text-[#A8A29E]">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-2xs ${
                          isAdmin
                            ? "bg-[#3E3734] text-white rounded-tr-xs"
                            : "bg-white text-[#2D3436] border border-[#E8E2DE] rounded-tl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Bar */}
            <form
              onSubmit={handleSendReply}
              className="p-3 border-t border-[#E8E2DE] bg-white flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type reply to vendor..."
                maxLength={2000}
                disabled={sending || loadingMessages}
                className="flex-1 bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#2D3436] outline-none focus:border-[#C87A65] focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || sending || loadingMessages}
                className="w-9 h-9 rounded-xl bg-[#C87A65] hover:bg-[#B76954] text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs shrink-0"
              >
                {sending ? (
                  <FiLoader size={15} className="animate-spin" />
                ) : (
                  <FiSend size={15} />
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLiveChatSection;
