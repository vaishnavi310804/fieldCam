import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/src/constants/color";
import { dashboardApi, VendorStaffItem } from "@/src/api/dashboard.api";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import { StaffProfileCard } from "@/src/components/team/StaffProfileCard";
import { StaffProjectHistory } from "@/src/components/team/StaffProjectHistory";
import { StaffDetailsActions } from "@/src/components/team/StaffDetailsActions";

export const StaffDetailsScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [staff, setStaff] = useState<VendorStaffItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffDetails = useCallback(
    async (showLoading = true) => {
      if (!id) {
        setError("Invalid staff member ID.");
        setIsLoading(false);
        return;
      }

      try {
        if (showLoading) setIsLoading(true);
        setError(null);

        const staffList = await dashboardApi.getVendorStaffList();
        const found = staffList.find((item) => item._id === id);

        if (found) {
          setStaff(found);
        } else {
          setError("Staff member not found or no longer active.");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load staff details.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchStaffDetails();
  }, [fetchStaffDetails]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchStaffDetails(false);
  };

  return (
    <View style={styles.screenContainer}>
      <PageHeader title="Staff Details" showBackButton={true} />

      {isLoading && !isRefreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading staff details...</Text>
        </View>
      ) : error || !staff ? (
        <View style={styles.contentPadding}>
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
            <Text style={styles.errorTitle}>Error Loading Staff</Text>
            <Text style={styles.errorText}>
              {error || "Staff member details could not be found."}
            </Text>
            <View style={styles.errorButtonRow}>
              <Pressable
                style={styles.retryButton}
                onPress={() => fetchStaffDetails()}
              >
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backText}>Back to Team</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          <StaffProfileCard staff={staff} />
          <StaffProjectHistory />
          <StaffDetailsActions staff={staff} onRefreshNeeded={() => fetchStaffDetails(false)} />
        </ScrollView>
      )}
    </View>
  );
};

export default StaffDetailsScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingBottom:100,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  contentPadding: {
    padding: 16,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray,
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 10,
    marginBottom: 6,
  },
  errorText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  errorButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
});
