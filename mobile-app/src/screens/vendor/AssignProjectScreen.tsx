import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/src/constants/color";
import {
  dashboardApi,
  VendorProjectItem,
  VendorStaffItem,
} from "@/src/api/dashboard.api";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import { ProjectAssignmentCard } from "@/src/components/team/ProjectAssignmentCard";
import { AssignmentConfirmationModal } from "@/src/components/team/AssignmentConfirmationModal";

export const AssignProjectScreen: React.FC = () => {
  const router = useRouter();
  const { staffId } = useLocalSearchParams<{ staffId?: string }>();

  const [projects, setProjects] = useState<VendorProjectItem[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<VendorStaffItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedProjectForModal, setSelectedProjectForModal] =
    useState<VendorProjectItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        setError(null);

        // Fetch projects & staff in parallel from backend API
        const [fetchedProjects, fetchedStaffList] = await Promise.all([
          dashboardApi.getVendorProjects(),
          staffId ? dashboardApi.getVendorStaffList() : Promise.resolve([]),
        ]);

        // Filter out completed / approved projects based on backend status semantics
        const assignableProjects = fetchedProjects.filter((p) => {
          const s = (p.status || "").toUpperCase();
          return s !== "APPROVED" && s !== "COMPLETED";
        });

        setProjects(assignableProjects);

        if (staffId && fetchedStaffList.length > 0) {
          const foundStaff = fetchedStaffList.find((s) => s._id === staffId);
          if (foundStaff) {
            setSelectedStaff(foundStaff);
          }
        }
      } catch (err: any) {
        setError(err?.message || "Unable to load projects. Please try again.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [staffId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData(false);
  };

  const handleSelectProject = (project: VendorProjectItem) => {
    setSelectedProjectForModal(project);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalVisible(false);
    setSelectedProjectForModal(null);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedProjectForModal) return;

    if (!selectedStaff?._id) {
      Alert.alert(
        "Assign Project Error",
        "Staff member ID is missing or invalid."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const updatedProject = await dashboardApi.assignProjectToStaff(
        selectedProjectForModal._id,
        selectedStaff._id
      );

      setIsSubmitting(false);
      setIsModalVisible(false);

      const targetProjectName =
        updatedProject.projectName || selectedProjectForModal.projectName;
      const targetStaffName = selectedStaff.name;

      setSelectedProjectForModal(null);

      // Navigate to Project Assigned success screen with real data!
      router.push({
        pathname: "/(app)/project-assigned",
        params: {
          projectName: targetProjectName,
          staffName: targetStaffName,
        },
      });
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert(
        "Assignment Failed",
        err?.message || "Unable to assign project. Please try again."
      );
    }
  };

  return (
    <View style={styles.screenContainer}>
      <PageHeader title="Assign Project" showBackButton={true} />

      {isLoading && !isRefreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading available projects...</Text>
        </View>
      ) : error ? (
        <View style={styles.contentPadding}>
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
            <Text style={styles.errorTitle}>Error Loading Projects</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => loadData()}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item._id || item.projectId}
          contentContainerStyle={styles.listContent}
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
            <View style={styles.headerSection}>
              {selectedStaff ? (
                <View style={styles.staffTargetBanner}>
                  <Ionicons name="person-outline" size={16} color="#6B5E54" />
                  <Text style={styles.staffTargetText} numberOfLines={1}>
                    Assigning project to:{" "}
                    <Text style={styles.staffNameBold}>
                      {selectedStaff.name}
                    </Text>
                  </Text>
                </View>
              ) : null}

              <Text style={styles.sectionHeaderTitle}>
                AVAILABLE PROJECTS ({projects.length})
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProjectAssignmentCard
              project={item}
              onSelect={handleSelectProject}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconBox}>
                <Ionicons
                  name="folder-open-outline"
                  size={32}
                  color="#9CA3AF"
                />
              </View>
              <Text style={styles.emptyTitle}>
                No projects available for assignment
              </Text>
              <Text style={styles.emptySubtitle}>
                There are currently no active or assignable projects for your
                vendor account.
              </Text>
            </View>
          }
        />
      )}

      {/* REUSABLE CONFIRMATION MODAL */}
      <AssignmentConfirmationModal
        visible={isModalVisible}
        project={selectedProjectForModal}
        staff={selectedStaff}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAssignment}
        isSubmitting={isSubmitting}
      />
    </View>
  );
};

export default AssignProjectScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  contentPadding: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 16,
  },
  staffTargetBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3EFEA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
  },
  staffTargetText: {
    fontSize: 13,
    color: "#6B5E54",
    flex: 1,
  },
  staffNameBold: {
    fontWeight: "700",
    color: Colors.black,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.8,
    textTransform: "uppercase",
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
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
});
