import { useState, useCallback } from "react";
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
import { router, useFocusEffect } from "expo-router";
import Colors from "@/src/constants/color";
import { useAuth } from "@/src/context/AuthContext";
import {
  getVendorProjects,
  acceptProject,
  VendorProjectItem,
} from "@/src/api/dashboard.api";
import { notificationsApi } from "@/src/api/notifications.api";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import { ProjectSearchBar } from "@/src/components/projects/ProjectSearchBar";
import { ProjectFilterTabs } from "@/src/components/projects/ProjectFilterTabs";
import {
  ProjectCard,
  ProjectCardData,
} from "@/src/components/projects/ProjectCard";

export const VendorProjectsScreen = () => {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to map backend VendorProjectItem -> ProjectCardData
  const mapProjectItemToCardData = (
    item: VendorProjectItem,
  ): ProjectCardData => {
    let calculatedProgress: number | undefined = undefined;

    const statusUpper = (item.status || "").toUpperCase();
    const isPendingAcceptance = statusUpper === "NEW" || statusUpper === "ASSIGNED";

    if (!isPendingAcceptance) {
      if (typeof item.progress === "number" && !isNaN(item.progress)) {
        calculatedProgress = item.progress;
      } else if (
        Array.isArray(item.checklistItems) &&
        item.checklistItems.length > 0
      ) {
        const checked = item.checklistItems.filter((c) => c.checked).length;
        calculatedProgress = Math.round(
          (checked / item.checklistItems.length) * 100,
        );
      }
    }

    const firstPhotoUrl =
      Array.isArray(item.photos) && item.photos.length > 0 && item.photos[0].url
        ? item.photos[0].url
        : undefined;

    return {
      id: item._id,
      projectId: item.projectId || item.projectName || "Project",
      projectName: item.projectName,
      location: item.location || "Location pending",
      status: item.status || "New",
      imageUrl: firstPhotoUrl,
      progress: calculatedProgress,
    };
  };

  // Fetch real projects from backend API
  const fetchProjectsData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const realProjects = await getVendorProjects();
      const mapped = (realProjects || []).map(mapProjectItemToCardData);
      setProjects(mapped);
    } catch (err: any) {
      console.error("Failed to load vendor projects:", err);
      setError(err?.message || "Failed to load projects.");
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
      console.warn("Failed to fetch unread count:", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProjectsData(true);
      fetchUnreadCount();
    }, [fetchProjectsData, fetchUnreadCount]),
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProjectsData(false);
    fetchUnreadCount();
  }, [fetchProjectsData, fetchUnreadCount]);

  const handleAcceptProject = async (targetId: string) => {
    try {
      setAcceptingId(targetId);
      await acceptProject(targetId);
      Alert.alert(
        "Success",
        "Project accepted successfully! It is now In Progress.",
      );
      await fetchProjectsData(false);
      await fetchUnreadCount();
    } catch (err: any) {
      Alert.alert(
        "Acceptance Failed",
        err?.message || "Could not accept project.",
      );
    } finally {
      setAcceptingId(null);
    }
  };

  // Filter projects by selected tab & search query
  const filteredProjects = projects.filter((project) => {
    const normalizedStatus = project.status.toLowerCase();
    const normalizedTab = selectedTab.toLowerCase();

    let matchesTab = normalizedTab === "all";
    if (!matchesTab) {
      if (normalizedTab === "new") {
        matchesTab =
          normalizedStatus === "new" || normalizedStatus === "assigned";
      } else if (normalizedTab === "in progress") {
        matchesTab =
          normalizedStatus === "in progress" || normalizedStatus === "active";
      } else if (normalizedTab === "submitted") {
        matchesTab =
          normalizedStatus === "submitted" ||
          normalizedStatus === "under review";
      } else if (normalizedTab === "completed") {
        matchesTab =
          normalizedStatus === "completed" || normalizedStatus === "approved";
      } else {
        matchesTab = normalizedStatus === normalizedTab;
      }
    }

    const matchesSearch =
      !searchQuery.trim() ||
      project.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.projectName &&
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

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
        <PageHeader
          title="Projects"
          showBackButton={true}
          onBackPress={() => router.back()}
        />

        {/* Screen Title Heading */}
        <View style={styles.titleHeaderArea}>
          <Text style={styles.pageTitleText}>Projects</Text>
        </View>

        {/* Search Bar */}
        <ProjectSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search projects..."
        />

        {/* Filter Tabs */}
        <ProjectFilterTabs
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
        />

        {/* Loading / Error / Content State */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Fetching projects...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={36} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => fetchProjectsData(true)}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : filteredProjects.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="briefcase-outline" size={32} color="#8C827A" />
            </View>
            <Text style={styles.emptyStateTitle}>
              {projects.length === 0
                ? "No projects yet"
                : "No matching projects"}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {projects.length === 0
                ? "Projects assigned to you will appear here."
                : "Try adjusting your search or filter tab."}
            </Text>
          </View>
        ) : (
          filteredProjects.map((item) => (
            <ProjectCard
              key={item.id || item.projectId}
              project={item}
              onPress={() =>
                router.push({
                  pathname: "/(app)/project-details",
                  params: { id: item.id || item.projectId },
                } as any)
              }
              onAcceptPress={() =>
                handleAcceptProject(item.id || item.projectId)
              }
              showAcceptButton={acceptingId === (item.id || item.projectId)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default VendorProjectsScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollContent: {
    paddingBottom: 120, // Extra padding to prevent bottom tab overlap
  },
  titleHeaderArea: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  pageTitleText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F0F0F",
    letterSpacing: -0.4,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#817B77",
  },
  errorContainer: {
    marginTop: 30,
    marginHorizontal: 20,
    padding: 24,
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyStateContainer: {
    marginTop: 40,
    marginHorizontal: 20,
    padding: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F2EBE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3E3734",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: "#817B77",
    textAlign: "center",
    lineHeight: 18,
  },
});
