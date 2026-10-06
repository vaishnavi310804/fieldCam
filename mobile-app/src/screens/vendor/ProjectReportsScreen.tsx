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
import { router } from "expo-router";
import Colors from "@/src/constants/color";
import { dashboardApi, VendorProjectItem } from "@/src/api/dashboard.api";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import { ProjectReportCard } from "@/src/components/reports/ProjectReportCard";

export const ProjectReportsScreen = () => {
  const [projects, setProjects] = useState<VendorProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      const data = await dashboardApi.getVendorProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load project reports.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchReports(false);
  };

  const handleShare = () => {
    // Shared visual feedback action
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <PageHeader
        title="Project Reports"
        showBackButton
        rightElement={
          <Pressable
            style={styles.headerShareButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share project reports"
          >
            <Ionicons name="share-outline" size={20} color="#1A1A1A" />
          </Pressable>
        }
      />

      {/* BODY CONTENT */}
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
        {isLoading && !isRefreshing ? (
          /* LOADING STATE */
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Fetching project reports...</Text>
          </View>
        ) : error ? (
          /* ERROR STATE */
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
            <Text style={styles.errorTitle}>Unable to Load Reports</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => fetchReports()}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : projects.length === 0 ? (
          /* EMPTY STATE */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBadge}>
              <Ionicons name="document-text-outline" size={40} color="#A1A1AA" />
            </View>
            <Text style={styles.emptyTitle}>No Project Reports Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your assigned work order reports will be listed here once created.
            </Text>
          </View>
        ) : (
          /* REAL PROJECT REPORT CARDS */
          <View style={styles.listContainer}>
            {projects.map((project) => (
              <ProjectReportCard
                key={project._id}
                project={project}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/project-report",
                    params: { id: project._id },
                  } as any)
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ProjectReportsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerShareButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    gap: 2,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: Colors.gray,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginVertical: 40,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DC2626",
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: "#991B1B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginVertical: 40,
  },
  emptyIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#18181B",
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.gray,
    textAlign: "center",
    marginTop: 6,
  },
});
