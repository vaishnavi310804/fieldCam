import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiX,
  FiSend,
  FiMessageSquare,
  FiAlertCircle,
  FiLoader,
  FiCheckCircle,
} from "react-icons/fi";
import {
  getVendorConversation,
  sendVendorMessage,
} from "../../../services/chatService";

const VendorLiveChatModal = ({ isOpen, onClose }) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [inputText, setInputText] = useState("");

  const isFetchingRef = useRef(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatData = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (isInitial) setLoading(true);
      const res = await getVendorConversation();
      const data = res?.data || res || {};

      setConversation(data.conversation || null);

      if (Array.isArray(data.messages)) {
        setMessages((prev) => {
          // Reconcile messages by _id to avoid duplicates
          const map = new Map();
          prev.forEach((m) => map.set(m._id, m));
          data.messages.forEach((m) => map.set(m._id, m));
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          return merged;
        });
      }
    } catch (err) {
      if (isInitial) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load chat conversation"
        );
      }
    } finally {
      if (isInitial) setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Polling setup: Polls every 3.5 seconds while modal is open
  useEffect(() => {
    if (!isOpen) return;

    fetchChatData(true);

    const intervalId = setInterval(() => {
      fetchChatData(false);
    }, 3500);

    return () => {
      clearInterval(intervalId);
    };
  }, [isOpen, fetchChatData]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await sendVendorMessage(text);
      const data = res?.data || res;

      if (data?.conversation) {
        setConversation(data.conversation);
      }
      if (data?.message) {
        setMessages((prev) => [...prev, data.message]);
      }

      setInputText("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E8E2DE] shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8E2DE] bg-gradient-to-r from-[#FAF7F5] to-[#F4F0ED] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold shadow-2xs">
              <FiMessageSquare size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#3E3734] tracking-tight">
                  Live Support Chat
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-[#817B77] font-medium">
                Direct channel with FieldCam Support Desk
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white border border-[#E8E2DE] text-[#817B77] hover:text-[#3E3734] hover:bg-[#FAF7F5] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-[#FFEBEE] border-b border-[#C62828]/20 text-[#C62828] px-4 py-2.5 text-xs font-semibold flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="text-sm shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-[#C62828] hover:underline text-[11px] font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Message Stream Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#FAF8F6] space-y-3">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-[#817B77] space-y-2">
              <FiLoader className="text-2xl animate-spin text-[#C87A65]" />
              <p className="text-xs font-medium">Connecting to support channel...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-xl shadow-2xs">
                <FiMessageSquare />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#3E3734]">
                  Start a conversation
                </h3>
                <p className="text-xs text-[#817B77] max-w-xs mt-1">
                  Send a message below to chat with our Support team. An agent will respond shortly.
                </p>
              </div>
              <div className="text-[11px] text-[#817B77] px-3 py-1.5 rounded-xl font-medium">
                Available Monday – Friday, 9:00 AM – 6:00 PM
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isVendor = msg.senderRole === "VENDOR";
              return (
                <div
                  key={msg._id || `${msg.createdAt}-${msg.senderRole}`}
                  className={`flex flex-col ${
                    isVendor ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-baseline gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-[#817B77]">
                      {isVendor ? "You" : msg.senderName || "Admin Support"}
                    </span>
                    <span className="text-[9px] text-[#A8A29E]">
                      {formatMessageTime(msg.createdAt)}
                    </span>
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-2xs ${
                      isVendor
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

        {/* Input Footer */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-[#E8E2DE] bg-white flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            maxLength={2000}
            disabled={sending || loading}
            className="flex-1 bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#2D3436] outline-none focus:border-[#C87A65] focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending || loading}
            className="w-9 h-9 rounded-xl bg-[#C87A65] hover:bg-[#B76954] text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs shrink-0"
          >
            {sending ? (
              <FiLoader size={15} className="animate-spin" />
            ) : (
              <FiSend size={15} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorLiveChatModal;
