import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/src/constants/color";
import { useAuth } from "@/src/context/AuthContext";
import {
  dashboardApi,
  VendorDashboardData,
  VendorInvoiceItem,
} from "@/src/api/dashboard.api";
import { notificationsApi } from "@/src/api/notifications.api";
import {
  MonthlyEarningsChart,
  MonthlyEarningsPoint,
} from "@/src/components/charts/MonthlyEarningsChart";
import { VendorDashboardHeader } from "@/src/components/dashboard/VendorDashboardHeader";

const { width } = Dimensions.get("window");

const VendorDashboardScreen = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<VendorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      const res = await dashboardApi.getVendorDashboardData();
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load vendor dashboard data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsApi.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (err) {
      console.warn("Failed to fetch unread notification count:", err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [fetchUnreadCount])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData(false);
    fetchUnreadCount();
  };

  const vendor = data?.profile;
  const invoices = data?.invoices || [];
  const supportStats = data?.supportStats || { totalTickets: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };
  const projectStats = vendor?.projectStats || { assigned: 0, completed: 0, waitingForApproval: 0 };
  const projects = vendor?.projects || [];

  // Calculate monthly earnings from paid invoices
  const monthlyEarnings = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);

  // Calculate monthly chart data from real paid/approved invoices
  const monthlyChartSeries = invoices
    .filter((inv: VendorInvoiceItem) => inv.status === "Paid" || inv.status === "Approved")
    .reduce<MonthlyEarningsPoint[]>((acc, inv) => {
      const dateStr = inv.paymentDate || inv.createdAt;
      if (!dateStr) return acc;
      const d = new Date(dateStr);
      const label = d.toLocaleString("en-US", { month: "short" });
      const amount = inv.totalAmount || inv.amount || 0;
      const existing = acc.find((item) => item.label === label);
      if (existing) {
        existing.value += amount;
      } else {
        acc.push({ label, value: amount });
      }
      return acc;
    }, []);

  // Calculate Approval Rate
  const approvalRate =
    projectStats.assigned > 0
      ? Math.round((projectStats.completed / projectStats.assigned) * 100)
      : null;

  // Calculate total photos count across projects
  const totalPhotosCount = projects.reduce(
    (count, p) => count + (Array.isArray(p.photos) ? p.photos.length : 0),
    0
  );

  // Active projects list
  const activeProjects = projects.filter((p) => p.status !== "Completed" && p.status !== "Approved");
  const upcomingDeadlines = activeProjects.slice(0, 3);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusProgress = (status: string): number => {
    switch (status) {
      case "Approved":
      case "Completed":
        return 100;
      case "In Progress":
        return 65;
      case "Submitted":
        return 50;
      case "Under Review":
        return 30;
      default:
        return 10;
    }
  };

  const handleQuickAction = (title: string, targetRoute?: string) => {
    if (targetRoute) {
      router.push(targetRoute as any);
    } else {
      Alert.alert("Quick Action", `${title} feature will be available in the upcoming release.`);
    }
  };

  return (
    <View style={styles.screenContainer}>
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
        {/* HEADER AREA */}
        <VendorDashboardHeader
          name={vendor?.contactName || vendor?.companyName || user?.name || "Vendor Partner"}
          initials={vendor?.initials || user?.name?.slice(0, 2).toUpperCase() || "VD"}
          notificationCount={unreadCount}
          onNotificationPress={() => router.push("/notifications" as any)}
          onAvatarPress={logout}
        />

        <View style={styles.bodyContent}>
          {/* LOADING STATE */}
          {isLoading && !isRefreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Fetching vendor metrics...</Text>
            </View>
          ) : error ? (
            /* ERROR STATE */
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={36} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={() => fetchDashboardData()}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* MONTHLY EARNINGS CARD */}
              <View style={styles.earningsCard}>
                <View style={styles.earningsHeader}>
                  <View style={styles.earningsTitleRow}>
                    <View style={styles.earningsIconBox}>
                      <Ionicons name="trending-up-outline" size={16} color={Colors.gray} />
                    </View>
                    <Text style={styles.earningsLabel}>Monthly Earnings</Text>
                  </View>

                  <View style={styles.earningsPill}>
                    <Text style={styles.earningsPillText}>
                      {formatCurrency(monthlyEarnings)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.earningsAmount}>
                  {formatCurrency(monthlyEarnings)}
                </Text>

                {/* Standalone Monthly Earnings Chart Component */}
                <MonthlyEarningsChart data={monthlyChartSeries} />
              </View>

              {/* SUMMARY METRIC CARDS */}
              <View style={styles.summaryRow}>
                {/* Active Projects */}
                <Pressable
                  style={styles.summaryCard}
                  onPress={() => router.push("/(app)/projects" as any)}
                >
                  <View style={[styles.summaryIconBadge, { backgroundColor: "#EBF5FF" }]}>
                    <Ionicons name="folder-open-outline" size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.summaryValue}>{projectStats.assigned}</Text>
                  <Text style={styles.summaryLabel}>Active</Text>
                </Pressable>

                {/* Due Today */}
                <Pressable
                  style={styles.summaryCard}
                  onPress={() => router.push("/(app)/projects" as any)}
                >
                  <View style={[styles.summaryIconBadge, { backgroundColor: "#FEF3C7" }]}>
                    <Ionicons name="time-outline" size={18} color="#D97706" />
                  </View>
                  <Text style={styles.summaryValue}>
                    {activeProjects.filter((p) => p.status === "In Progress").length}
                  </Text>
                  <Text style={styles.summaryLabel}>Due Today</Text>
                </Pressable>

                {/* Alerts */}
                <Pressable
                  style={styles.summaryCard}
                  onPress={() => router.push("/(app)/support" as any)}
                >
                  <View style={[styles.summaryIconBadge, { backgroundColor: "#FEE2E2" }]}>
                    <Ionicons name="warning-outline" size={18} color="#DC2626" />
                  </View>
                  <Text style={styles.summaryValue}>{supportStats.open}</Text>
                  <Text style={styles.summaryLabel}>Alerts</Text>
                </Pressable>
              </View>

              {/* PERFORMANCE METRICS GRID (2x2) */}
              <View style={styles.performanceGrid}>
                {/* Photos Taken */}
                <View style={styles.perfCard}>
                  <View style={[styles.perfIconBadge, { backgroundColor: "#F3E8FF" }]}>
                    <Ionicons name="camera-outline" size={18} color="#9333EA" />
                  </View>
                  <Text style={styles.perfValue}>{totalPhotosCount}</Text>
                  <Text style={styles.perfLabel}>Photos Taken</Text>
                </View>

                {/* Approval Rate */}
                <View style={styles.perfCard}>
                  <View style={[styles.perfIconBadge, { backgroundColor: "#DCFCE7" }]}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
                  </View>
                  <Text style={styles.perfValue}>
                    {approvalRate !== null ? `${approvalRate}%` : "N/A"}
                  </Text>
                  <Text style={styles.perfLabel}>Approval Rate</Text>
                </View>

                {/* On-Time Rate */}
                <View style={styles.perfCard}>
                  <View style={[styles.perfIconBadge, { backgroundColor: "#E0F2FE" }]}>
                    <Ionicons name="pulse-outline" size={18} color="#0284C7" />
                  </View>
                  <Text style={styles.perfValue}>
                    {projectStats.assigned > 0 ? "98%" : "N/A"}
                  </Text>
                  <Text style={styles.perfLabel}>On-Time Rate</Text>
                </View>

                {/* Vendor Rating */}
                <View style={styles.perfCard}>
                  <View style={[styles.perfIconBadge, { backgroundColor: "#FEF9C3" }]}>
                    <Ionicons name="star-outline" size={18} color="#CA8A04" />
                  </View>
                  <Text style={styles.perfValue}>
                    {vendor?.rating ? vendor.rating.toFixed(1) : "N/A"}
                  </Text>
                  <Text style={styles.perfLabel}>Vendor Rating</Text>
                </View>
              </View>

              {/* RECENT PROJECTS SECTION */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recent Projects</Text>
                <Pressable onPress={() => router.push("/(app)/projects" as any)}>
                  <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
                </Pressable>
              </View>

              {projects.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="folder-outline" size={32} color="#A1A1AA" />
                  <Text style={styles.emptyTitle}>No Assigned Projects</Text>
                  <Text style={styles.emptySubtitle}>
                    New assigned work orders will appear here.
                  </Text>
                </View>
              ) : (
                projects.slice(0, 3).map((item) => {
                  const progress = getStatusProgress(item.status);
                  const hasPhoto = item.photos && item.photos.length > 0 && item.photos[0].url;

                  return (
                    <View key={item._id} style={styles.projectCard}>
                      {hasPhoto ? (
                        <Image
                          source={{ uri: item.photos![0].url }}
                          style={styles.projectImage}
                        />
                      ) : (
                        <View style={styles.projectImagePlaceholder}>
                          <Ionicons name="business" size={24} color={Colors.primary} />
                        </View>
                      )}

                      <View style={styles.projectInfo}>
                        <Text style={styles.projectLocation} numberOfLines={1}>
                          {item.location || item.projectName}
                        </Text>
                        <Text style={styles.projectIdText}>
                          {item.projectId || item.serviceTypeName || "Project"}
                        </Text>

                        <View style={styles.progressBarWrapper}>
                          <View style={styles.progressBarTrack}>
                            <View
                              style={[
                                styles.progressBarFill,
                                { width: `${progress}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressPercent}>{progress}%</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}

              {/* UPCOMING DEADLINES SECTION */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
              </View>

              {upcomingDeadlines.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="calendar-outline" size={32} color="#A1A1AA" />
                  <Text style={styles.emptyTitle}>No Upcoming Deadlines</Text>
                  <Text style={styles.emptySubtitle}>
                    You have no pending deadlines at this time.
                  </Text>
                </View>
              ) : (
                <View style={styles.deadlinesCard}>
                  {upcomingDeadlines.map((item, idx) => (
                    <View
                      key={item._id}
                      style={[
                        styles.deadlineRow,
                        idx < upcomingDeadlines.length - 1 && styles.deadlineBorder,
                      ]}
                    >
                      <View
                        style={[
                          styles.urgencyDot,
                          idx === 0 ? styles.dotRed : styles.dotYellow,
                        ]}
                      />
                      <View style={styles.deadlineInfo}>
                        <Text style={styles.deadlineTitle}>
                          {item.location || item.projectName}
                        </Text>
                        <Text style={styles.deadlineTime}>
                          {idx === 0 ? "Today, 5:00 PM" : "Tomorrow, 12:00 PM"}
                        </Text>
                      </View>

                      {idx === 0 ? (
                        <View style={styles.urgentPill}>
                          <Text style={styles.urgentText}>Urgent</Text>
                        </View>
                      ) : (
                        <Ionicons name="chevron-forward" size={16} color="#A1A1AA" />
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* QUICK ACTIONS SECTION */}
              <View style={styles.quickActionsRow}>
                {/* Capture */}
                <Pressable
                  style={styles.actionCard}
                  onPress={() => handleQuickAction("Capture Photo", "/(app)/capture")}
                >
                  <View style={[styles.actionIconBadge, { backgroundColor: "#F3E8FF" }]}>
                    <Ionicons name="camera" size={20} color="#9333EA" />
                  </View>
                  <Text style={styles.actionLabel}>Capture</Text>
                </Pressable>

                {/* Reports */}
                <Pressable
                  style={styles.actionCard}
                  onPress={() => handleQuickAction("Reports")}
                >
                  <View style={[styles.actionIconBadge, { backgroundColor: "#EDE9FE" }]}>
                    <Ionicons name="document-text" size={20} color="#7C3AED" />
                  </View>
                  <Text style={styles.actionLabel}>Reports</Text>
                </Pressable>

                {/* Performance */}
                <Pressable
                  style={styles.actionCard}
                  onPress={() => handleQuickAction("Performance Dashboard")}
                >
                  <View style={[styles.actionIconBadge, { backgroundColor: "#CFFAFE" }]}>
                    <Ionicons name="flash" size={20} color="#0891B2" />
                  </View>
                  <Text style={styles.actionLabel} numberOfLines={2}>
                    Performance
                  </Text>
                </Pressable>

                {/* Team */}
                <Pressable
                  style={styles.actionCard}
                  onPress={() => handleQuickAction("Team")}
                >
                  <View style={[styles.actionIconBadge, { backgroundColor: "#FEF3C7" }]}>
                    <Ionicons name="people" size={20} color="#D97706" />
                  </View>
                  <Text style={styles.actionLabel}>Team</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default VendorDashboardScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollContent: {
    paddingBottom: 110,
  },
  headerGradient: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  vendorNameText: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.black,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFECE8",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTag: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#DC2626",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D6C6BB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: "700",
  },

  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: Colors.gray,
    fontSize: 13,
  },

  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginVertical: 20,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  /* MONTHLY EARNINGS CARD */
  earningsCard: {
    backgroundColor: "#EBE3DE",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  earningsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  earningsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  earningsIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  earningsLabel: {
    fontSize: 13,
    color: "#555555",
    fontWeight: "600",
  },
  earningsPill: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  earningsPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.black,
    marginTop: 10,
    marginBottom: 10,
  },

  /* SUMMARY ROW */
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.black,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 2,
  },

  /* PERFORMANCE GRID */
  performanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  perfCard: {
    width: (width - 42) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  perfIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  perfValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.black,
  },
  perfLabel: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 2,
  },

  /* SECTION HEADERS */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },

  /* RECENT PROJECTS */
  projectCard: {
    backgroundColor: "#E2DDD8",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  projectImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  projectImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#D6CDBF",
    alignItems: "center",
    justifyContent: "center",
  },
  projectInfo: {
    flex: 1,
  },
  projectLocation: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.black,
  },
  projectIdText: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 2,
    marginBottom: 8,
  },
  progressBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.black,
  },

  /* DEADLINES */
  deadlinesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  deadlineBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  urgencyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotRed: {
    backgroundColor: "#EF4444",
  },
  dotYellow: {
    backgroundColor: "#F59E0B",
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.black,
  },
  deadlineTime: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 2,
  },
  urgentPill: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  urgentText: {
    color: "#DC2626",
    fontSize: 10,
    fontWeight: "700",
  },

  /* EMPTY CARD */
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: "center",
    marginTop: 2,
  },

  /* QUICK ACTIONS */
  quickActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.black,
    textAlign: "center",
  },
});
