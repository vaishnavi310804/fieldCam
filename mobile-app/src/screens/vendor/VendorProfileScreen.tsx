import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { getVendorProfile, VendorProfileData } from "../../api/dashboard.api";

export const VendorProfileScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 20) + 16;

  const [profile, setProfile] = useState<VendorProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      const data = await getVendorProfile();
      setProfile(data);
    } catch (err: any) {
      console.error("Failed to load vendor profile:", err);
      setError(err?.message || "Failed to load vendor profile.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile(true);
    }, [fetchProfile])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProfile(false);
  }, [fetchProfile]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)");
    }
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing feature is coming soon.");
  };

  const contactName =
    profile?.contactName || profile?.userId?.name || profile?.companyName || "Vendor Partner";
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

  const phone = profile?.userId?.phone || "Not specified";
  const email = profile?.userId?.email || "Not specified";
  const location = profile?.location || "Not specified";
  const vendorIdDisplay = profile?._id || "Not specified";

  const serviceTypes = Array.isArray(profile?.services) ? profile!.services : [];
  const stats = profile?.projectStats || {
    assigned: 0,
    active: 0,
    completed: 0,
    waitingForApproval: 0,
  };

  return (
    <View style={styles.screen}>
      {/* HEADER WITH GRADIENT & PROFILE OVERLAY */}
      <LinearGradient
        colors={["#D8CCC2", "#C2B2A5", "#A8988B"]}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.headerContainer, { paddingTop: topPadding }]}
      >
        {/* Navigation Bar Row */}
        <View style={styles.headerNavRow}>
          <Pressable
            style={styles.actionSquare}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
          </Pressable>

          <Text style={styles.headerTitleText}>Profile</Text>

          {/* Settings Icon */}
          <Pressable
            style={styles.actionSquare}
            onPress={() => router.push("/settings" as any)}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={22} color="#1A1A1A" />
          </Pressable>
        </View>

        {/* Avatar & Vendor Identifier Block */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: profile?.avatarBg || "#C87A65" },
              ]}
            >
              <Text style={styles.avatarInitialsText}>{initials}</Text>
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#786C62" />
            </View>
          </View>

          <Text style={styles.vendorNameText} numberOfLines={1}>
            {contactName}
          </Text>

          {companyName ? (
            <Text style={styles.companyNameText} numberOfLines={1}>
              {companyName}
            </Text>
          ) : null}

          {profile?.rating !== undefined ? (
            <Text style={styles.ratingText}>
              ★ {profile.rating}
              {profile.status ? ` — ${profile.status} Tier` : ""}
            </Text>
          ) : null}
        </View>
      </LinearGradient>

      {/* BODY CONTENT */}
      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6B5E54" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : error || !profile ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={40} color="#DC2626" />
          <Text style={styles.errorText}>{error || "Failed to load profile"}</Text>
          <Pressable style={styles.retryButton} onPress={() => fetchProfile(true)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#6B5E54"]}
              tintColor="#6B5E54"
            />
          }
        >
          {/* CONTACT INFO CARDS */}
          <View style={styles.infoCardsList}>
            {/* Phone */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="call-outline" size={20} color="#6B5E54" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{phone}</Text>
              </View>
            </View>

            {/* Email */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="mail-outline" size={20} color="#6B5E54" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{email}</Text>
              </View>
            </View>

            {/* Service Area */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="location-outline" size={20} color="#6B5E54" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Service Area</Text>
                <Text style={styles.infoValue}>{location}</Text>
              </View>
            </View>

            {/* Vendor ID */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="shield-outline" size={20} color="#6B5E54" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Vendor ID</Text>
                <Text style={styles.infoValue}>{vendorIdDisplay}</Text>
              </View>
            </View>
          </View>

          {/* SERVICE TYPES SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Service Types</Text>
            {serviceTypes.length > 0 ? (
              <View style={styles.pillsContainer}>
                {serviceTypes.map((type, idx) => (
                  <View key={idx} style={styles.servicePill}>
                    <Text style={styles.servicePillText}>{type}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptySectionText}>No service types specified.</Text>
            )}
          </View>

          {/* STATISTICS SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Completed Jobs</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.active}</Text>
                <Text style={styles.statLabel}>Active Projects</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.assigned}</Text>
                <Text style={styles.statLabel}>Assigned Jobs</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.waitingForApproval}</Text>
                <Text style={styles.statLabel}>Awaiting Approval</Text>
              </View>
            </View>
          </View>

          {/* EDIT PROFILE BUTTON */}
          <View style={styles.actionSection}>
            <Pressable
              style={styles.editProfileButton}
              onPress={handleEditProfile}
              accessibilityRole="button"
              accessibilityLabel="Edit Profile"
            >
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default VendorProfileScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F6F4",
    paddingBottom: 100,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    zIndex: 1,
  },
  headerNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitleText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F0F0F",
  },
  actionSquare: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSection: {
    alignItems: "center",
    paddingBottom: 4,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitialsText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#A8988B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  vendorNameText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F0F0F",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  companyNameText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A423F",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#784500",
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6B5E54",
    fontWeight: "500",
  },
  errorText: {
    marginTop: 12,
    fontSize: 15,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#6B5E54",
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  infoCardsList: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  infoIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F5F0EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8C7E72",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  servicePill: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  servicePillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  emptySectionText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  actionSection: {
    marginTop: 8,
  },
  editProfileButton: {
    backgroundColor: "#928880",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  editProfileButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
