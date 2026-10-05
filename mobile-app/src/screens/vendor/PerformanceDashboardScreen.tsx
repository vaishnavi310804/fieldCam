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
import Colors from "@/src/constants/color";
import {
  dashboardApi,
  VendorDashboardData,
} from "@/src/api/dashboard.api";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import {
  PerformancePeriod,
  PerformancePeriodSelector,
} from "@/src/components/performance/PerformancePeriodSelector";
import { PerformanceMetricsGrid } from "@/src/components/performance/PerformanceMetricsGrid";
import {
  CompletionTrendPoint,
  ProjectCompletionTrend,
} from "@/src/components/performance/ProjectCompletionTrend";
import { ApprovalRateCard } from "@/src/components/performance/ApprovalRateCard";
import { WorkQualityInsights } from "@/src/components/performance/WorkQualityInsights";
import { ScoreBreakdown, ScoreItem } from "@/src/components/performance/ScoreBreakdown";
import { RecentFeedback } from "@/src/components/performance/RecentFeedback";

export const PerformanceDashboardScreen: React.FC = () => {
  const [data, setData] = useState<VendorDashboardData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PerformancePeriod>("monthly");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformanceData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      const result = await dashboardApi.getVendorDashboardData();
      setData(result);
    } catch (err: any) {
      setError(
        err?.message || "Unable to load performance data. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchPerformanceData(false);
  };

  const profile = data?.profile;
  const allProjects = profile?.projects || [];

  // Filter projects by selected period (weekly: 7d, monthly: 30d, yearly: 365d)
  const now = new Date().getTime();
  const periodDays =
    selectedPeriod === "weekly" ? 7 : selectedPeriod === "monthly" ? 30 : 365;
  const cutoffTime = now - periodDays * 24 * 60 * 60 * 1000;

  const periodProjects = allProjects.filter((p) => {
    const projectDate = p.updatedAt || p.createdAt;
    if (!projectDate) return true;
    return new Date(projectDate).getTime() >= cutoffTime;
  });

  // 1. Total Completed Projects
  const completedProjects = periodProjects.filter((p) => {
    const s = (p.status || "").toUpperCase();
    return s === "APPROVED" || s === "COMPLETED";
  });
  const completedCount = completedProjects.length;

  // 2. Rejected Projects
  const rejectedProjects = periodProjects.filter((p) => {
    const s = (p.status || "").toUpperCase();
    return s === "REJECTED";
  });
  const rejectedCount = rejectedProjects.length;

  // 3. Submitted / Under Review Projects
  const submittedProjects = periodProjects.filter((p) => {
    const s = (p.status || "").toUpperCase();
    return s === "SUBMITTED" || s === "UNDER REVIEW";
  });
  const submittedCount = submittedProjects.length;

  // 4. Approval Rate Calculation
  const finishedTotal = completedCount + rejectedCount;
  const approvalRate =
    finishedTotal > 0
      ? Math.round((completedCount / finishedTotal) * 100)
      : profile?.projectStats?.assigned && profile.projectStats.assigned > 0
      ? Math.round((completedCount / profile.projectStats.assigned) * 100)
      : null;

  // 5. Active Projects Count
  const activeProjectsCount = periodProjects.filter((p) => {
    const s = (p.status || "").toUpperCase();
    return s !== "APPROVED" && s !== "COMPLETED";
  }).length;

  // 6. Total Photos Uploaded
  const photosUploadedCount = periodProjects.reduce(
    (count, p) => count + (Array.isArray(p.photos) ? p.photos.length : 0),
    0
  );

  // 7. Average Completion Time Calculation (from real project timestamps)
  let avgCompletionTimeText = "N/A";
  if (completedProjects.length > 0) {
    let totalDurationMs = 0;
    let validCount = 0;

    completedProjects.forEach((p) => {
      if (p.createdAt && p.updatedAt) {
        const start = new Date(p.createdAt).getTime();
        const end = new Date(p.updatedAt).getTime();
        if (end > start) {
          totalDurationMs += end - start;
          validCount++;
        }
      }
    });

    if (validCount > 0) {
      const avgHours = totalDurationMs / validCount / (1000 * 60 * 60);
      if (avgHours < 24) {
        const hours = Math.floor(avgHours);
        const mins = Math.round((avgHours - hours) * 60);
        avgCompletionTimeText = `${hours}h ${mins}m`;
      } else {
        const days = (avgHours / 24).toFixed(1);
        avgCompletionTimeText = `${days} days`;
      }
    }
  }

  // 8. Project Completion Trend Bar Chart Data
  const trendData: CompletionTrendPoint[] = [];
  if (selectedPeriod === "weekly") {
    // 7 days breakdown
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const count = completedProjects.filter((p) => {
        if (!p.updatedAt) return false;
        const pDate = new Date(p.updatedAt);
        return (
          pDate.getDate() === d.getDate() &&
          pDate.getMonth() === d.getMonth() &&
          pDate.getFullYear() === d.getFullYear()
        );
      }).length;
      trendData.push({ label: dayLabel, value: count });
    }
  } else if (selectedPeriod === "monthly") {
    // 4 weeks breakdown
    for (let w = 4; w >= 1; w--) {
      const weekLabel = `W${5 - w}`;
      const startMs = now - w * 7 * 24 * 60 * 60 * 1000;
      const endMs = now - (w - 1) * 7 * 24 * 60 * 60 * 1000;

      const count = completedProjects.filter((p) => {
        const pTime = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
        return pTime >= startMs && pTime < endMs;
      }).length;

      trendData.push({ label: weekLabel, value: count });
    }
  } else {
    // 4 quarters / months breakdown
    const months = ["Q1", "Q2", "Q3", "Q4"];
    months.forEach((m, idx) => {
      const count = completedProjects.filter((p) => {
        if (!p.updatedAt) return false;
        const month = new Date(p.updatedAt).getMonth();
        return Math.floor(month / 3) === idx;
      }).length;
      trendData.push({ label: m, value: count });
    });
  }

  // 9. Work Quality Insights: Real AI Validation Pass Rate
  let totalVerifiedPhotos = 0;
  let passedPhotos = 0;

  periodProjects.forEach((p) => {
    if (Array.isArray(p.photos)) {
      p.photos.forEach((photo) => {
        if (photo.aiValidation) {
          totalVerifiedPhotos++;
          if (photo.aiValidation.status === "PASSED") {
            passedPhotos++;
          }
        }
      });
    }
  });

  const aiQualityScore =
    totalVerifiedPhotos > 0
      ? Math.round((passedPhotos / totalVerifiedPhotos) * 100)
      : null;

  // 10. Score Breakdown (Photo Quality & Timeliness)
  const scoreItems: ScoreItem[] = [];
  if (aiQualityScore !== null) {
    scoreItems.push({
      label: "Photo Quality",
      score: aiQualityScore,
      icon: "camera-outline",
      color: "#8B5CF6",
    });
  }

  if (completedProjects.length > 0) {
    let onTimeCount = 0;
    completedProjects.forEach((p) => {
      if (p.deadline && p.updatedAt) {
        if (new Date(p.updatedAt).getTime() <= new Date(p.deadline).getTime()) {
          onTimeCount++;
        }
      } else {
        onTimeCount++;
      }
    });

    const timelinessScore = Math.round(
      (onTimeCount / completedProjects.length) * 100
    );
    scoreItems.push({
      label: "Timeliness",
      score: timelinessScore,
      icon: "time-outline",
      color: "#10B981",
    });
  }

  return (
    <View style={styles.screenContainer}>
      <PageHeader title="Performance Dashboard" showBackButton={true} />

      {isLoading && !isRefreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading performance metrics...</Text>
        </View>
      ) : error ? (
        <View style={styles.contentPadding}>
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
            <Text style={styles.errorTitle}>Error Loading Performance</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => fetchPerformanceData()}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
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
          {/* PERIOD SELECTOR */}
          <PerformancePeriodSelector
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
          />

          {/* KEY PERFORMANCE METRICS GRID */}
          <PerformanceMetricsGrid
            completedCount={completedCount}
            rejectedCount={rejectedCount}
            approvalRate={approvalRate}
            avgCompletionTimeText={avgCompletionTimeText}
            photosUploadedCount={photosUploadedCount}
            activeProjectsCount={activeProjectsCount}
          />

          {/* PROJECT COMPLETION TREND CHART */}
          <ProjectCompletionTrend
            data={trendData}
            subLabel={
              selectedPeriod === "weekly"
                ? "Past 7 Days"
                : selectedPeriod === "monthly"
                ? "Past 4 Weeks"
                : "Yearly Breakdown"
            }
          />

          {/* APPROVAL RATE BREAKDOWN */}
          <ApprovalRateCard
            approvedCount={completedCount}
            submittedCount={submittedCount}
            rejectedCount={rejectedCount}
            approvalRate={approvalRate}
          />

          {/* WORK QUALITY INSIGHTS */}
          <WorkQualityInsights
            aiQualityScore={aiQualityScore}
            totalPhotosVerified={totalVerifiedPhotos}
          />

          {/* SCORE BREAKDOWN */}
          {scoreItems.length > 0 ? <ScoreBreakdown items={scoreItems} /> : null}

          {/* RECENT FEEDBACK */}
          <RecentFeedback feedbackList={[]} />
        </ScrollView>
      )}
    </View>
  );
};

export default PerformanceDashboardScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingBottom: 80,
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
});
