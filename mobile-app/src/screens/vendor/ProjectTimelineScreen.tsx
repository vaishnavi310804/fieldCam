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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "../../components/navigation/PageHeader";
import {
  ProjectTimelineItem,
  TimelineStepItem,
} from "../../components/projects/ProjectTimelineItem";
import { getProjectById, VendorProjectItem } from "../../api/dashboard.api";
import { AuditLogItem, getProjectAuditLogs } from "../../api/audit.api";

interface ProjectTimelineScreenProps {
  projectId?: string;
}

export const ProjectTimelineScreen: React.FC<ProjectTimelineScreenProps> = ({
  projectId,
}) => {
  const router = useRouter();

  const [project, setProject] = useState<VendorProjectItem | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTimelineData = useCallback(
    async (showLoadingIndicator = true) => {
      if (!projectId) {
        setErrorMessage("No project ID provided.");
        setIsLoading(false);
        return;
      }

      if (showLoadingIndicator) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const [projectData, logsData] = await Promise.all([
          getProjectById(projectId),
          getProjectAuditLogs(projectId),
        ]);

        setProject(projectData);
        setAuditLogs(logsData || []);
      } catch (err: any) {
        console.error("Failed to load project timeline data:", err);
        setErrorMessage(
          err?.message || "Failed to load project timeline. Please try again."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [projectId]
  );

  useEffect(() => {
    fetchTimelineData(true);
  }, [fetchTimelineData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTimelineData(false);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/projects");
    }
  };

  // Helper to format ISO date strings into "MMM d, h:mm a" format (e.g. "Mar 9, 10:00 AM")
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Pending";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "Pending";

      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Pending";
    }
  };

  // Helper to format action codes into human-friendly event titles
  const formatAuditActionTitle = (
    action: string,
    metadata?: Record<string, any>
  ): string => {
    switch (action) {
      case "PROJECT_CREATED":
        return "Project Created";
      case "PROJECT_ASSIGNED":
        return "Project Assigned";
      case "PROJECT_ACCEPTED":
        return "Assignment Accepted";
      case "PROJECT_STATUS_CHANGED":
        return metadata?.newStatus
          ? `Status Changed to ${metadata.newStatus}`
          : "Status Changed";
      case "PROJECT_UPDATED":
        return "Project Updated";
      case "PHOTO_UPLOADED":
        return "Photo Uploaded";
      default:
        if (!action) return "Audit Event";
        return action
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
    }
  };

  // Build timeline items derived EXCLUSIVELY from actual backend AuditLog records
  const buildTimelineSteps = (): TimelineStepItem[] => {
    if (!Array.isArray(auditLogs) || auditLogs.length === 0) {
      return [];
    }

    // Sort audit logs chronologically (oldest first) for top-to-bottom timeline flow
    const sortedLogs = [...auditLogs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return sortedLogs.map((log, index) => {
      const isLatest = index === sortedLogs.length - 1;
      return {
        id: log._id || `log-${index}`,
        title: formatAuditActionTitle(log.action, log.metadata),
        description: log.description || "",
        dateText: formatDate(log.createdAt),
        status: isLatest ? "current" : "completed",
      };
    });
  };

  const timelineSteps = buildTimelineSteps();
  const displayProjectId = project?.projectId || projectId || "";

  return (
    <View style={styles.screen}>
      <PageHeader title="Project Timeline" onBackPress={handleBack} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B5E54" />
          <Text style={styles.loadingText}>Loading timeline...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text style={styles.errorTitle}>Unable to load timeline</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => fetchTimelineData(true)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#6B5E54"
            />
          }
        >
          {/* Real Project Identifier Heading */}
          <View style={styles.headerIdContainer}>
            <Text style={styles.headerIdText}>{displayProjectId}</Text>
          </View>

          {/* Timeline Nodes List */}
          {timelineSteps.length > 0 ? (
            <View style={styles.timelineList}>
              {timelineSteps.map((step, index) => {
                const isFirst = index === 0;
                const isLast = index === timelineSteps.length - 1;
                const prevStep = index > 0 ? timelineSteps[index - 1] : null;
                const prevCompleted = prevStep?.status === "completed" || prevStep?.status === "current";

                return (
                  <ProjectTimelineItem
                    key={step.id}
                    item={step}
                    isFirst={isFirst}
                    isLast={isLast}
                    prevCompleted={prevCompleted}
                  />
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
              <Text style={styles.emptyText}>
                No timeline history recorded for this project yet.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default ProjectTimelineScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F6F4",
  },
  loadingContainer: {
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 12,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#6B5E54",
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerIdContainer: {
    marginBottom: 20,
  },
  headerIdText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.2,
  },
  timelineList: {
    paddingLeft: 4,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
});
