import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useFocusEffect, useRouter } from "expo-router";
import { PageHeader } from "../../components/navigation/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { getVendorProfile, VendorProfileData } from "../../api/dashboard.api";

export const VendorSettingsScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<VendorProfileData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Local visual toggle state ONLY (UI-only)
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState<boolean>(true);
  const [isDarkThemeEnabled, setIsDarkThemeEnabled] = useState<boolean>(false);

  const fetchProfileData = useCallback(async () => {
    try {
      const data = await getVendorProfile();
      setProfile(data);
    } catch (err) {
      console.warn("Failed to load vendor profile for settings summary:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [fetchProfileData])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProfileData();
  }, [fetchProfileData]);

  const handleBackToProfile = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile" as any);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/(auth)/login");
            } catch (err: any) {
              console.error("Logout error:", err);
              Alert.alert(
                "Logout Failed",
                err?.message || "Failed to log out. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const contactName =
    profile?.contactName || profile?.userId?.name || user?.name || "Vendor Partner";
  const companyName = profile?.companyName || "";
  const initials =
    profile?.initials ||
    contactName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "VD";

  const appVersion = Constants.expoConfig?.version || (Constants.manifest as any)?.version;

  return (
    <View style={styles.screen}>
      <PageHeader title="Settings" showBackButton={true} onBackPress={handleBackToProfile} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#6B5E54"
          />
        }
      >
        {/* PROFILE SUMMARY CARD */}
        <Pressable
          style={styles.profileCard}
          onPress={handleBackToProfile}
          accessibilityRole="button"
          accessibilityLabel="Profile settings summary"
        >
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: profile?.avatarBg || "#C87A65" },
            ]}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileNameText} numberOfLines={1}>
              {contactName}
            </Text>
            {companyName ? (
              <Text style={styles.companyNameText} numberOfLines={1}>
                {companyName}
              </Text>
            ) : null}
          </View>

          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>

        {/* ACCOUNT SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <View style={styles.cardGroup}>
            {/* Profile Settings */}
            <Pressable
              style={styles.rowItem}
              onPress={() =>
                Alert.alert("Profile Settings", "Profile editing feature is coming soon.")
              }
              accessibilityRole="button"
              accessibilityLabel="Profile Settings"
            >
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={20} color="#6B5E54" />
              </View>
              <Text style={styles.rowLabel}>Profile Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <View style={styles.divider} />

            {/* Language Settings */}
            <Pressable
              style={styles.rowItem}
              onPress={() =>
                Alert.alert("Language Settings", "Language selection is coming soon.")
              }
              accessibilityRole="button"
              accessibilityLabel="Language Settings"
            >
              <View style={styles.iconContainer}>
                <Ionicons name="language-outline" size={20} color="#6B5E54" />
              </View>
              <Text style={styles.rowLabel}>Language Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* PREFERENCES SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>PREFERENCES</Text>
          <View style={styles.cardGroup}>
            {/* Notification Settings (UI ONLY) */}
            <View style={styles.rowItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications-outline" size={20} color="#6B5E54" />
              </View>
              <Text style={styles.rowLabel}>Notification Settings</Text>
              <Switch
                value={isNotificationsEnabled}
                onValueChange={setIsNotificationsEnabled}
                trackColor={{ false: "#E5E7EB", true: "#A8988B" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Dark Theme (UI ONLY) */}
            <View style={styles.rowItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="moon-outline" size={20} color="#6B5E54" />
              </View>
              <Text style={styles.rowLabel}>Dark Theme</Text>
              <Switch
                value={isDarkThemeEnabled}
                onValueChange={setIsDarkThemeEnabled}
                trackColor={{ false: "#E5E7EB", true: "#A8988B" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        {/* VERSION LABEL */}
        {appVersion ? (
          <Text style={styles.versionText}>Version {appVersion}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default VendorSettingsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F6F4",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  profileNameText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  companyNameText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  cardGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAE4DF",
    overflow: "hidden",
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F5F0EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 68,
  },
  logoutButton: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DC2626",
  },
  versionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
    textAlign: "center",
  },
});
