import { useState, useCallback, useEffect } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import Colors from "@/src/constants/color";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import {
  getProjectById,
  VendorProjectItem,
  VendorChecklistItem,
} from "@/src/api/dashboard.api";

export default function CaptureScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const projectIdParam = params.id;

  const [project, setProject] = useState<VendorProjectItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedChecklistItemId, setSelectedChecklistItemId] = useState<string | null>(null);
  const [step, setStep] = useState<"select_category" | "ready_for_camera">("select_category");

  const fetchProjectData = useCallback(async (showLoading = true) => {
    if (!projectIdParam) {
      setError("No project ID specified.");
      setIsLoading(false);
      return;
    }

    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const fetchedProject = await getProjectById(projectIdParam);
      setProject(fetchedProject);
    } catch (err: any) {
      console.error("Failed to fetch project details for capture:", err);
      setError(err?.message || "Failed to load project photo categories.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [projectIdParam]);

  useEffect(() => {
    fetchProjectData(true);
  }, [fetchProjectData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProjectData(false);
  }, [fetchProjectData]);

  const handleBackPress = () => {
    if (step === "ready_for_camera") {
      setStep("select_category");
    } else {
      router.back();
    }
  };

  const statusUpper = (project?.status || "").toUpperCase();
  const isInProgress = statusUpper === "IN PROGRESS";

  const checklistItems: VendorChecklistItem[] = Array.isArray(project?.checklistItems)
    ? project!.checklistItems
    : [];

  const selectedItem = checklistItems.find(
    (item) => item.id === selectedChecklistItemId
  );

  return (
    <View style={styles.screenContainer}>
      <PageHeader
        title={step === "ready_for_camera" ? "Ready for Capture" : "Select Photo Category"}
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading photo categories...</Text>
        </View>
      ) : error || !project ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={40} color="#DC2626" />
          <Text style={styles.errorText}>{error || "Project not found"}</Text>
          <Pressable style={styles.retryButton} onPress={() => fetchProjectData(true)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : !isInProgress ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#D97706" />
          <Text style={styles.blockedTitle}>Photo Capture Blocked</Text>
          <Text style={styles.blockedSubtext}>
            Photo capture is allowed only when project status is &quot;In Progress&quot;. Current status is &quot;{project.status}&quot;.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Return to Project Details</Text>
          </Pressable>
        </View>
      ) : step === "select_category" ? (
        <View style={styles.flexOne}>
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
            {/* Context Header */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons name="camera" size={20} color={Colors.primary} />
                <Text style={styles.infoCardTitle}>Select Requirement</Text>
              </View>
              <Text style={styles.infoCardSubtext}>
                Choose a checklist requirement item below to prepare for photo capture.
              </Text>
              <View style={styles.projectBadge}>
                <Text style={styles.projectBadgeText}>{project.projectId}</Text>
                {project.projectName ? (
                  <Text style={styles.projectNameSubtext} numberOfLines={1}>
                    • {project.projectName}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Checklist Category Options */}
            {checklistItems.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="list-outline" size={32} color="#A39A94" />
                <Text style={styles.emptyCardText}>
                  No photo categories available for this project.
                </Text>
              </View>
            ) : (
              <View style={styles.categoryList}>
                {checklistItems.map((item) => {
                  const isSelected = item.id === selectedChecklistItemId;
                  return (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.categoryCard,
                        isSelected && styles.categoryCardSelected,
                      ]}
                      onPress={() => setSelectedChecklistItemId(item.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={item.label}
                    >
                      <View style={styles.categoryRadioCol}>
                        <Ionicons
                          name={isSelected ? "radio-button-on" : "radio-button-off"}
                          size={22}
                          color={isSelected ? Colors.primary : "#A39A94"}
                        />
                      </View>

                      <View style={styles.categoryTextCol}>
                        <Text
                          style={[
                            styles.categoryLabel,
                            isSelected && styles.categoryLabelSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </View>

                      <View style={styles.categoryStatusCol}>
                        {item.checked ? (
                          <View style={styles.completedTag}>
                            <Ionicons name="checkmark-circle" size={12} color="#166534" />
                            <Text style={styles.completedTagText}>Uploaded</Text>
                          </View>
                        ) : (
                          <View style={styles.pendingTag}>
                            <Text style={styles.pendingTagText}>Pending</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Fixed Continue Action Bar */}
          <View style={styles.bottomActionBar}>
            <Pressable
              style={[
                styles.primaryButton,
                !selectedChecklistItemId && styles.buttonDisabled,
              ]}
              onPress={() => {
                if (selectedChecklistItemId) {
                  setStep("ready_for_camera");
                }
              }}
              disabled={!selectedChecklistItemId}
              accessibilityRole="button"
              accessibilityLabel="Continue to Camera"
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.btnIconRight} />
            </Pressable>
          </View>
        </View>
      ) : (
        /* Ready for Step 2 Transition State */
        <View style={styles.flexOne}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.readyCard}>
              <View style={styles.readyIconCircle}>
                <Ionicons name="camera-outline" size={36} color={Colors.primary} />
              </View>

              <Text style={styles.readyTitle}>Category Established</Text>
              <Text style={styles.readySubtext}>
                The selected category is ready for Step 2 Camera Capture.
              </Text>

              <View style={styles.detailBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Project ID:</Text>
                  <Text style={styles.detailValue}>{project.projectId}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Checklist Item ID:</Text>
                  <Text style={styles.detailValue}>{selectedItem?.id || selectedChecklistItemId}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category Label:</Text>
                  <Text style={styles.detailValue}>{selectedItem?.label || "N/A"}</Text>
                </View>
              </View>

              <Pressable
                style={styles.secondaryButton}
                onPress={() => setStep("select_category")}
              >
                <Text style={styles.secondaryButtonText}>Change Category</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  flexOne: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#817B77",
  },
  errorText: {
    marginVertical: 12,
    fontSize: 14,
    color: "#991B1B",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  blockedTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#92400E",
    marginTop: 12,
    marginBottom: 8,
  },
  blockedSubtext: {
    fontSize: 14,
    color: "#78350F",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1917",
  },
  infoCardSubtext: {
    fontSize: 13,
    color: "#6E6762",
    lineHeight: 18,
    marginBottom: 12,
  },
  projectBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F3EFEA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  projectBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  projectNameSubtext: {
    fontSize: 12,
    color: "#5C524A",
    fontWeight: "500",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  emptyCardText: {
    marginTop: 8,
    fontSize: 14,
    color: "#817B77",
    textAlign: "center",
  },
  categoryList: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#FAF8F5",
  },
  categoryRadioCol: {
    marginRight: 12,
  },
  categoryTextCol: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#292524",
  },
  categoryLabelSelected: {
    fontWeight: "700",
    color: "#1C1917",
  },
  categoryStatusCol: {
    marginLeft: 8,
  },
  completedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  completedTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#166534",
  },
  pendingTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingTagText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
  },
  bottomActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  btnIconRight: {
    marginLeft: 8,
  },
  readyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  readyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.peach,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  readyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1C1917",
    marginBottom: 6,
  },
  readySubtext: {
    fontSize: 14,
    color: "#6E6762",
    textAlign: "center",
    marginBottom: 20,
  },
  detailBox: {
    width: "100%",
    backgroundColor: "#F9F6F3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    color: "#6E6762",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1C1917",
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#F3EFEA",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
