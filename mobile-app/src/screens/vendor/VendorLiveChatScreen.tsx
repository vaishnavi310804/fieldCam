import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/src/constants/color";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import {
  getVendorConversation,
  sendVendorMessage,
  ChatMessage,
  ChatConversation,
} from "@/src/api/chat.api";

export const VendorLiveChatScreen: React.FC = () => {
  const [, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const isFetchingRef = useRef<boolean>(false);

  const fetchChat = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (isInitial) setIsLoading(true);
      const data = await getVendorConversation();
      setConversation(data.conversation || null);

      if (Array.isArray(data.messages)) {
        setMessages((prev) => {
          const map = new Map<string, ChatMessage>();
          prev.forEach((m) => map.set(m._id, m));
          data.messages.forEach((m) => map.set(m._id, m));
          return Array.from(map.values()).sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
    } catch (err: any) {
      if (isInitial) {
        setError(err?.message || "Failed to load chat history");
      }
    } finally {
      if (isInitial) setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Poll every 3.5 seconds while this screen is in focus
  useFocusEffect(
    useCallback(() => {
      fetchChat(true);

      const intervalId = setInterval(() => {
        fetchChat(false);
      }, 3500);

      return () => {
        clearInterval(intervalId);
      };
    }, [fetchChat])
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const res = await sendVendorMessage(trimmed);
      if (res?.conversation) {
        setConversation(res.conversation);
      }
      if (res?.message) {
        setMessages((prev) => [...prev, res.message]);
      }
      setInputText("");
    } catch (err: any) {
      setError(err?.message || "Failed to send message. Please retry.");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isVendor = item.senderRole === "VENDOR";

    return (
      <View
        style={[
          styles.messageRow,
          isVendor ? styles.messageRowRight : styles.messageRowLeft,
        ]}
      >
        <View style={styles.senderLabelContainer}>
          <Text style={styles.senderLabelText}>
            {isVendor ? "You" : item.senderName || "Admin Support"}
          </Text>
          <Text style={styles.timestampText}>{formatTime(item.createdAt)}</Text>
        </View>

        <View
          style={[
            styles.bubble,
            isVendor ? styles.bubbleVendor : styles.bubbleAdmin,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isVendor ? styles.bubbleTextVendor : styles.bubbleTextAdmin,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <PageHeader
        title="Live Chat"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* Support Online Banner */}
        <View style={styles.channelBanner}>
          <View style={styles.statusDot} />
          <Text style={styles.channelBannerText}>
            Direct support channel with FieldCam Desk (Mon – Fri)
          </Text>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorText} numberOfLines={2}>
              {error}
            </Text>
            <Pressable onPress={() => setError(null)} hitSlop={8}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </Pressable>
          </View>
        )}

        {/* Main Content Area */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Connecting to live chat...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={32}
                color="#8C827A"
              />
            </View>
            <Text style={styles.emptyTitle}>Start a conversation</Text>
            <Text style={styles.emptySubtitle}>
              Type your message below to begin chatting with our Support team. An
              agent will reply shortly.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input Footer */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#A8A29E"
            multiline={true}
            maxLength={2000}
            editable={!isSending && !isLoading}
          />
          <Pressable
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending || isLoading) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending || isLoading}
            accessibilityRole="button"
            accessibilityLabel="Send Message"
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={16} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VendorLiveChatScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F9F6F3",
    paddingBottom: 120,
  },
  keyboardContainer: {
    flex: 1,
  },
  channelBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE4DF",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A",
  },
  channelBannerText: {
    fontSize: 12,
    color: "#5D5753",
    fontWeight: "500",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#FCA5A5",
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: "#991B1B",
  },
  dismissText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#817B77",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EEE9E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C2724",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#817B77",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
  },
  messageListContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  messageRow: {
    marginBottom: 4,
  },
  messageRowLeft: {
    alignItems: "flex-start",
  },
  messageRowRight: {
    alignItems: "flex-end",
  },
  senderLabelContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 3,
    paddingHorizontal: 4,
  },
  senderLabelText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#78716C",
  },
  timestampText: {
    fontSize: 10,
    color: "#A8A29E",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleVendor: {
    backgroundColor: "#3E3734",
    borderTopRightRadius: 4,
  },
  bubbleAdmin: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bubbleTextVendor: {
    color: "#FFFFFF",
  },
  bubbleTextAdmin: {
    color: "#2D3436",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: Colors.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
    // color: "#2D3436",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#928880",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
