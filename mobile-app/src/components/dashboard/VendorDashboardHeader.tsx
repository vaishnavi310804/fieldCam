import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface VendorDashboardHeaderProps {
  name: string;
  initials: string;
  notificationCount: number;
  onNotificationPress: () => void;
  onAvatarPress: () => void;
}

export const VendorDashboardHeader = ({
  name,
  initials,
  notificationCount,
  onNotificationPress,
  onAvatarPress,
}:VendorDashboardHeaderProps) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 20) + 30;

  return (
    <LinearGradient
      colors={["#D8CCC2", "#C2B2A5", "#A8988B"]}
      start={{ x: 0.8, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.headerContainer, { paddingTop: topPadding }]}
    >
      <View style={styles.headerRow}>
        {/* Left Side: Greeting & Vendor Name */}
        <View style={styles.nameBlock}>
          <Text style={styles.greetingText}>Good morning</Text>
          <Text style={styles.vendorNameText} numberOfLines={1} ellipsizeMode="tail">
            {name}
          </Text>
        </View>

        {/* Right Side: Notification & Avatar Buttons */}
        <View style={styles.headerActions}>
          {/* Notification Button */}
          <Pressable
            style={styles.actionSquare}
            onPress={onNotificationPress}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={22} color="#1A1A1A" />
            {notificationCount > 0 ? (
              <View style={styles.badgeTag}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? "99+" : notificationCount}
                </Text>
              </View>
            ) : null}
          </Pressable>

          {/* Avatar Button */}
          <Pressable
            style={styles.actionSquare}
            onPress={onAvatarPress}
            accessibilityRole="button"
            accessibilityLabel="User profile"
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
};

export default VendorDashboardHeader;

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    zIndex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  nameBlock: {
    flex: 1,
    marginRight: 16,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5C524A",
    marginBottom: 4,
  },
  vendorNameText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F0F0F",
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionSquare: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  badgeTag: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#EF4444",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
