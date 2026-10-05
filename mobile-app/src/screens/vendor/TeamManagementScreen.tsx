import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import Colors from "@/src/constants/color";
import { dashboardApi, VendorStaffItem } from "@/src/api/dashboard.api";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import { TeamSummaryCard } from "@/src/components/team/TeamSummaryCard";
import { TeamMemberCard } from "@/src/components/team/TeamMemberCard";

export const TeamManagementScreen = () => {
  const router = useRouter();
  const [members, setMembers] = useState<VendorStaffItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchStaffMembers = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      const data = await dashboardApi.getVendorStaffList();
      setMembers(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load vendor staff members.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffMembers();
  }, [fetchStaffMembers]);

  useFocusEffect(
    useCallback(() => {
      fetchStaffMembers(false);
    }, [fetchStaffMembers])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchStaffMembers(false);
  };

  // Metrics calculated directly from authenticated vendor's real staff records
  const totalCount = members.length;
  const activeCount = members.filter(
    (m) => (m.status || "").toUpperCase() === "ACTIVE"
  ).length;
  const inactiveCount = totalCount - activeCount;

  // Search filtering operating strictly on fetched vendor staff list
  const filteredMembers = members.filter((member) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();

    const name = (member.name || "").toLowerCase();
    const role = (member.role || "").toLowerCase();
    const email = (member.email || "").toLowerCase();
    const phone = (member.phone || "").toLowerCase();

    return (
      name.includes(query) ||
      role.includes(query) ||
      email.includes(query) ||
      phone.includes(query)
    );
  });

  return (
    <View style={styles.screenContainer}>
      {/* REUSABLE PAGE HEADER */}
      <PageHeader title="Team management" showBackButton={true} />

      {/* MAIN CONTENT */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item._id}
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
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* SUMMARY CARDS ROW */}
            <View style={styles.summaryRow}>
              <TeamSummaryCard
                count={totalCount}
                label="Total"
                dotColor="#FCA5A5"
              />
              <TeamSummaryCard
                count={activeCount}
                label="Active"
                dotColor="#22C55E"
              />
              <TeamSummaryCard
                count={inactiveCount}
                label="Inactive"
                dotColor="#FCA5A5"
              />
            </View>

            {/* SEARCH INPUT FIELD */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search staff by name or role..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              {searchQuery.length > 0 ? (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </Pressable>
              ) : null}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TeamMemberCard
            member={item}
            isExpanded={expandedId === item._id}
            onToggleExpand={() =>
              setExpandedId(expandedId === item._id ? null : item._id)
            }
          />
        )}
        ListEmptyComponent={
          isLoading && !isRefreshing ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading staff members...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable
                style={styles.retryButton}
                onPress={() => fetchStaffMembers()}
              >
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.centerBox}>
              <Ionicons name="people-outline" size={40} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? "No matching staff found" : "No staff members yet"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try searching with a different name or role."
                  : "Staff members will appear here once invited."}
              </Text>
            </View>
          )
        }
      />

      {/* "+ ADD STAFF" BUTTON */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.addStaffButton}
          onPress={() => router.push("/(app)/add-staff" as any)}
          accessibilityRole="button"
          accessibilityLabel="Add Staff"
        >
          <View style={styles.addIconCircle}>
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.addStaffText}>Add Staff</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default TeamManagementScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  listHeader: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
    padding: 0,
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.gray,
  },
  errorCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginVertical: 20,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.gray,
    textAlign: "center",
    marginTop: 4,
  },

  /* BOTTOM ADD STAFF BAR */
  bottomBar: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  addStaffButton: {
    backgroundColor: "#8C827A",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  addIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  addStaffText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
