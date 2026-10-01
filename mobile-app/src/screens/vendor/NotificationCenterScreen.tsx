import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/src/constants/color";
import {
  notificationsApi,
  NotificationItem,
} from "@/src/api/notifications.api";
import { PageHeader } from "@/src/components/navigation/PageHeader";

const formatNotificationTime = (isoString: string): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours === 1) return "1 hr ago";
  if (diffHours < 24) return `${diffHours} hrs ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Map notification type and text content to icon config (icon name & color).
 */
const getNotificationIconConfig = (
  type: string,
  title?: string,
  body?: string
): { name: keyof typeof Ionicons.glyphMap; color: string } => {
  const t = (title || "").toLowerCase();
  const b = (body || "").toLowerCase();

  if (t.includes("approved") || b.includes("approved") || t.includes("verified")) {
    return { name: "checkmark-circle-outline", color: "#10B981" };
  }
  if (t.includes("reject") || b.includes("reject") || t.includes("failed")) {
    return { name: "alert-circle-outline", color: "#EF4444" };
  }
  if (t.includes("payment") || t.includes("paid") || type === "INVOICE_UPDATED") {
    return { name: "cash-outline", color: "#10B981" };
  }
  if (t.includes("deadline") || t.includes("reminder")) {
    return { name: "time-outline", color: "#F59E0B" };
  }
  if (type === "PROJECT_UPDATED" || t.includes("project")) {
    return { name: "folder-outline", color: "#3B82F6" };
  }

  return { name: "notifications-outline", color: "#6B7280" };
};

export const NotificationCenterScreen = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err?.message || "Unable to load notifications.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(true);
    }, [fetchNotifications])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications(false);
  };

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (item.isRead) return;

    try {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === item._id
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
      await notificationsApi.markNotificationAsRead(item._id);
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
      fetchNotifications(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadExist = notifications.some((n) => !n.isRead);
    if (!unreadExist) return;

    try {
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
      await notificationsApi.markAllNotificationsAsRead();
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
      fetchNotifications(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    const { name: iconName, color: iconColor } = getNotificationIconConfig(
      item.type,
      item.title,
      item.body
    );

    const isUnread = !item.isRead;

    return (
      <Pressable
        style={[
          styles.itemBase,
          isUnread ? styles.unreadCard : styles.readRow,
        ]}
        onPress={() => handleMarkAsRead(item)}
      >
        {/* White Circle Icon Container */}
        <View style={styles.iconCircle}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>

        {/* Text Content Column */}
        <View style={styles.textContent}>
          <Text
            style={[
              styles.itemTitle,
              isUnread ? styles.unreadTitle : styles.readTitle,
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text style={styles.itemBody} numberOfLines={2}>
            {item.body}
          </Text>

          <Text style={styles.itemTime}>
            {formatNotificationTime(item.createdAt)}
          </Text>
        </View>

        {/* Unread Blue Dot */}
        {isUnread && <View style={styles.unreadBlueDot} />}
      </Pressable>
    );
  };

  return (
    <View style={styles.screenContainer}>
      {/* REUSABLE PAGE HEADER */}
      <PageHeader
        title="Notifications"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      {/* MARK ALL READ ACTION BAR */}
      {unreadCount > 0 && (
        <View style={styles.actionBar}>
          <Pressable style={styles.markAllButton} onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        </View>
      )}

      {/* BODY CONTENT */}
      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={44} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => fetchNotifications(true)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons
            name="notifications-off-outline"
            size={52}
            color="#9CA3AF"
          />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>
            You&apos;re all caught up! New updates will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderNotificationItem}
          contentContainerStyle={[
            styles.listContent,
            unreadCount === 0 && { paddingTop: 12 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

export default NotificationCenterScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#ECE8E3",
  },
  actionBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: "flex-end",
  },
  markAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3B82F6",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    marginTop: 12,
    fontSize: 15,
    color: "#374151",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  itemBase: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  /* UNREAD CARD STYLING */
  unreadCard: {
    backgroundColor: "#E2DCD6",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  /* READ ROW STYLING */
  readRow: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#D8D2CB",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  textContent: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    letterSpacing: -0.1,
  },
  unreadTitle: {
    fontWeight: "700",
    color: "#1E293B",
  },
  readTitle: {
    fontWeight: "600",
    color: "#475569",
  },
  itemBody: {
    fontSize: 12,
    fontWeight: "400",
    color: "#64748B",
    marginTop: 2,
    lineHeight: 16,
  },
  itemTime: {
    fontSize: 11,
    fontWeight: "400",
    color: "#94A3B8",
    marginTop: 4,
  },
  unreadBlueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
    marginTop: 6,
    marginRight: 2,
  },
});
