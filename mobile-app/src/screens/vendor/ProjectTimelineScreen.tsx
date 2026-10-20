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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PageHeader } from "../../components/navigation/PageHeader";
import {
  ProjectTimelineItem,
  TimelineStepItem,
} from "../../components/projects/ProjectTimelineItem";
import {
  getProjectById,
  getVendorProjects,
  VendorProjectItem,
} from "../../api/dashboard.api";
import { AuditLogItem, getProjectAuditLogs } from "../../api/audit.api";
import { buildProjectTimeline } from "../../utils/projectTimeline.utils";

interface ProjectTimelineScreenProps {
  projectId?: string;
}

export const ProjectTimelineScreen: React.FC<ProjectTimelineScreenProps> = ({
  projectId: propProjectId,
}) => {
  const router = useRouter();
  const routeParams = useLocalSearchParams<{ id?: string; projectId?: string }>();
  const effectiveProjectId =
    propProjectId ||
    (typeof routeParams.id === "string" ? routeParams.id : undefined) ||
    (typeof routeParams.projectId === "string" ? routeParams.projectId : undefined);

  const [project, setProject] = useState<VendorProjectItem | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTimelineData = useCallback(
    async (showLoadingIndicator = true) => {
      if (!effectiveProjectId) {
        setErrorMessage("No project ID provided.");
        setIsLoading(false);
        return;
      }

      if (showLoadingIndicator) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        let projectData: VendorProjectItem | null = null;
        try {
          projectData = await getProjectById(effectiveProjectId);
        } catch {
          // Fallback search in vendor projects list if direct ID lookup fails
          const allProjects = await getVendorProjects();
          projectData =
            allProjects.find(
              (p) =>
                p._id === effectiveProjectId ||
                p.projectId === effectiveProjectId
            ) || null;
        }

        if (!projectData) {
          throw new Error("Project not found.");
        }

        setProject(projectData);

        // Fetch audit logs by MongoDB ID and Project Number to ensure full log history
        const idToSearch = projectData._id || effectiveProjectId;
        const numberToSearch = projectData.projectId;

        let logs = await getProjectAuditLogs(idToSearch);
        if (numberToSearch && numberToSearch !== idToSearch) {
          const numberLogs = await getProjectAuditLogs(numberToSearch);
          if (Array.isArray(numberLogs) && numberLogs.length > 0) {
            const existingIds = new Set(logs.map((l) => l._id));
            for (const nl of numberLogs) {
              if (!existingIds.has(nl._id)) {
                logs.push(nl);
              }
            }
          }
        }

        setAuditLogs(logs || []);
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
    [effectiveProjectId]
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

  // Build the authoritative 8 lifecycle milestones matching the design target
  const timelineSteps: TimelineStepItem[] = buildProjectTimeline(
    project,
    auditLogs
  );

  const displayProjectId = project?.projectId || effectiveProjectId || "";

  return (
    <View style={styles.screen}>
      <PageHeader title="Project Timeline" onBackPress={handleBack} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B5E54" />
          <Text style={styles.loadingText}>Loading timeline...</Text>
        </View>
      ) : errorMessage || !project ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text style={styles.errorTitle}>Unable to load timeline</Text>
          <Text style={styles.errorText}>
            {errorMessage || "Project data unavailable"}
          </Text>
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
          {/* Project Identifier Heading matching reference design */}
          <View style={styles.headerIdContainer}>
            <Text style={styles.headerIdText}>{displayProjectId}</Text>
          </View>

          {/* Timeline Nodes List */}
          {timelineSteps.length > 0 ? (
            <View style={styles.timelineList}>
              {timelineSteps.map((step, index) => {
                const isFirst = index === 0;
                const isLast = index === timelineSteps.length - 1;
                const prevStep =
                  index > 0 ? timelineSteps[index - 1] : null;
                const prevCompleted =
                  prevStep?.status === "completed" ||
                  prevStep?.status === "current";

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
    paddingBottom: 100,
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerIdContainer: {
    marginBottom: 24,
  },
  headerIdText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.3,
  },
  timelineList: {
    paddingLeft: 2,
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
