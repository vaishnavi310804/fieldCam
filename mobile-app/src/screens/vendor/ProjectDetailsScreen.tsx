import { useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "@/src/constants/color";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import {
  getProjectById,
  getVendorProjects,
  acceptProject,
  getProjectNotes,
  addProjectNote,
  VendorProjectItem,
  VendorProjectNote,
} from "@/src/api/dashboard.api";

const getStatusBadgeStyle = (status: string) => {
  const normalized = (status || "").trim().toLowerCase();

  switch (normalized) {
    case "in progress":
    case "inprogress":
      return {
        bg: "#FEF9C3",
        text: "#854D0E",
        dot: "#CA8A04",
        label: "In Progress",
      };
    case "new":
    case "assigned":
      return {
        bg: "#DBEAFE",
        text: "#1E40AF",
        dot: "#2563EB",
        label: normalized === "assigned" ? "Assigned" : "New",
      };
    case "submitted":
    case "under review":
    case "underreview":
      return {
        bg: "#F3E8FF",
        text: "#6B21A8",
        dot: "#7C3AED",
        label: "Submitted",
      };
    case "completed":
    case "approved":
    case "active":
      return {
        bg: "#DCFCE7",
        text: "#166534",
        dot: "#16A34A",
        label: normalized === "active" ? "Active" : "Approved",
      };
    case "rejected":
      return {
        bg: "#FEE2E2",
        text: "#991B1B",
        dot: "#DC2626",
        label: "Rejected",
      };
    default:
      return {
        bg: "#F3F4F6",
        text: "#374151",
        dot: "#6B7280",
        label: status || "Pending",
      };
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatNoteDate = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

export const ProjectDetailsScreen = () => {
  const params = useLocalSearchParams<{ id?: string }>();
  const projectIdParam = params.id;

  const [project, setProject] = useState<VendorProjectItem | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "photos" | "notes">("overview");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Notes state
  const [notes, setNotes] = useState<VendorProjectNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState<boolean>(false);
  const [newNoteText, setNewNoteText] = useState<string>("");
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);

  const fetchNotes = useCallback(
    async (showLoading = true) => {
      const targetId = project?._id || project?.projectId || projectIdParam;
      if (!targetId) return;

      try {
        if (showLoading) setIsLoadingNotes(true);
        const fetchedNotes = await getProjectNotes(targetId);
        setNotes(fetchedNotes || []);
      } catch (err: any) {
        console.warn("Failed to fetch project notes:", err);
        if (project && Array.isArray(project.notes)) {
          setNotes(project.notes);
        }
      } finally {
        setIsLoadingNotes(false);
      }
    },
    [project, projectIdParam]
  );

  const handleSaveNote = async () => {
    const textToSave = newNoteText.trim();
    if (!textToSave) {
      Alert.alert("Empty Note", "Please enter a note before saving.");
      return;
    }

    const targetId = project?._id || project?.projectId || projectIdParam;
    if (!targetId) {
      Alert.alert("Error", "No valid project ID found.");
      return;
    }

    try {
      setIsSavingNote(true);
      await addProjectNote(targetId, textToSave);
      setNewNoteText("");
      await fetchNotes(false);
      Alert.alert("Success", "Note saved successfully.");
    } catch (err: any) {
      console.error("Failed to save note:", err);
      Alert.alert("Error", err?.message || "Failed to save note. Please try again.");
    } finally {
      setIsSavingNote(false);
    }
  };

  const fetchProjectData = useCallback(async (showLoading = true) => {
    if (!projectIdParam) {
      setError("No project ID specified.");
      setIsLoading(false);
      return;
    }

    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      let fetchedProject: VendorProjectItem | null = null;
      try {
        fetchedProject = await getProjectById(projectIdParam);
      } catch {
        // Fallback search in vendor projects list if direct ID lookup fails
        const allProjects = await getVendorProjects();
        fetchedProject =
          allProjects.find(
            (p) => p._id === projectIdParam || p.projectId === projectIdParam
          ) || null;
      }

      if (!fetchedProject) {
        throw new Error("Project not found.");
      }

      setProject(fetchedProject);
    } catch (err: any) {
      console.error("Failed to load project details:", err);
      setError(err?.message || "Failed to load project details.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [projectIdParam]);

  useEffect(() => {
    fetchProjectData(true);
  }, [fetchProjectData]);

  useEffect(() => {
    if (activeTab === "notes") {
      fetchNotes(true);
    }
  }, [activeTab, fetchNotes]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProjectData(false);
  }, [fetchProjectData]);

  const handleAcceptProject = async () => {
    if (!project) return;
    const targetId = project._id || project.projectId;

    try {
      setIsAccepting(true);
      await acceptProject(targetId);
      Alert.alert(
        "Success",
        "Project accepted successfully! It is now In Progress."
      );
      await fetchProjectData(false);
    } catch (err: any) {
      Alert.alert(
        "Acceptance Failed",
        err?.message || "Could not accept project. Please try again."
      );
    } finally {
      setIsAccepting(false);
    }
  };

  const handleStartCapture = () => {
    Alert.alert(
      "Start Capture",
      "Photo capture workflow for this project is coming soon."
    );
  };

  const handleOpenTimeline = () => {
    if (!project && !projectIdParam) return;
    const targetId = project?._id || project?.projectId || projectIdParam;
    if (targetId) {
      router.push({
        pathname: "/(app)/project-timeline",
        params: { id: targetId },
      } as any);
    }
  };

  // Status & Progress calculations
  const statusUpper = (project?.status || "").toUpperCase();
  const isAssignedOrNew = statusUpper === "ASSIGNED" || statusUpper === "NEW";
  const isInProgress = statusUpper === "IN PROGRESS";

  const checklist = Array.isArray(project?.checklistItems) ? project!.checklistItems : [];
  const totalChecklist = checklist.length;
  const checkedChecklist = checklist.filter((item) => item.checked).length;
  const hasChecklist = !isAssignedOrNew && totalChecklist > 0;
  const progressPercent = hasChecklist
    ? Math.round((checkedChecklist / totalChecklist) * 100)
    : 0;

  const photos = Array.isArray(project?.photos) ? project!.photos : [];
  const heroPhotoUrl = photos.length > 0 && photos[0].url ? photos[0].url : null;
  const badge = getStatusBadgeStyle(project?.status || "");

  return (
    <View style={styles.screenContainer}>
      {/* Existing FieldCam Page Header */}
      <PageHeader
        title="Project Details"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading project details...</Text>
        </View>
      ) : error || !project ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={40} color="#DC2626" />
          <Text style={styles.errorText}>{error || "Project not found"}</Text>
          <Pressable style={styles.retryButton} onPress={() => fetchProjectData(true)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
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
          {/* Top Hero Banner & Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroImageContainer}>
              {heroPhotoUrl ? (
                <Image
                  source={{ uri: heroPhotoUrl }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.heroPlaceholder}>
                  <Ionicons name="business" size={48} color={Colors.primary} />
                </View>
              )}

              {/* Status Badge Overlaid on Hero Image */}
              <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: badge.dot }]} />
                <Text style={[styles.statusText, { color: badge.text }]}>
                  {badge.label}
                </Text>
              </View>
            </View>

            {/* Project Primary Details Header */}
            <View style={styles.heroBody}>
              <Text style={styles.projectTitleText}>{project.projectId}</Text>
              {project.projectName ? (
                <Text style={styles.projectNameSubtext}>{project.projectName}</Text>
              ) : null}

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#5C524A"
                  style={styles.locationIcon}
                />
                <Text style={styles.locationText} numberOfLines={2}>
                  {project.location || "Location pending"}
                </Text>
              </View>
            </View>
          </View>

          {/* Navigation Tabs (Overview / Photos / Notes) */}
          <View style={styles.tabBarContainer}>
            <Pressable
              style={[styles.tabButton, activeTab === "overview" && styles.tabButtonActive]}
              onPress={() => setActiveTab("overview")}
            >
              <Text style={[styles.tabText, activeTab === "overview" && styles.tabTextActive]}>
                Overview
              </Text>
            </Pressable>

            <Pressable
              style={[styles.tabButton, activeTab === "photos" && styles.tabButtonActive]}
              onPress={() => setActiveTab("photos")}
            >
              <Text style={[styles.tabText, activeTab === "photos" && styles.tabTextActive]}>
                Photos ({photos.length})
              </Text>
            </Pressable>

            <Pressable
              style={[styles.tabButton, activeTab === "notes" && styles.tabButtonActive]}
              onPress={() => setActiveTab("notes")}
            >
              <Text style={[styles.tabText, activeTab === "notes" && styles.tabTextActive]}>
                Notes
              </Text>
            </Pressable>
          </View>

          {/* TAB CONTENT */}

          {/* OVERVIEW TAB */}
          {activeTab === "overview" ? (
            <View style={styles.tabContentArea}>
              {/* Photo / Checklist Progress Card (Only if NOT ASSIGNED and checklist exists) */}
              {hasChecklist ? (
                <View style={styles.sectionCard}>
                  <View style={styles.progressHeaderRow}>
                    <Text style={styles.sectionCardTitle}>Photo Progress</Text>
                    <Text style={styles.progressRatioText}>
                      {checkedChecklist}/{totalChecklist}
                    </Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                    />
                  </View>

                  {/* Checklist Items */}
                  <View style={styles.checklistItemsContainer}>
                    {checklist.map((item) => (
                      <View key={item.id} style={styles.checklistItemRow}>
                        <Ionicons
                          name={item.checked ? "checkmark-circle" : "ellipse-outline"}
                          size={20}
                          color={item.checked ? "#16A34A" : "#D1D5DB"}
                          style={styles.checklistIcon}
                        />
                        <Text
                          style={[
                            styles.checklistItemLabel,
                            item.checked && styles.checklistItemLabelChecked,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : isAssignedOrNew ? null : (
                <View style={styles.emptyCard}>
                  <Ionicons name="list-outline" size={24} color="#A39A94" />
                  <Text style={styles.emptyCardText}>No checklist items available.</Text>
                </View>
              )}

              {/* Metadata Cards */}
              {project.deadline ? (
                <View style={styles.metaCard}>
                  <View style={styles.metaIconWrapper}>
                    <Ionicons name="calendar-outline" size={20} color="#6E6762" />
                  </View>
                  <View style={styles.metaTextCol}>
                    <Text style={styles.metaLabel}>Due Date</Text>
                    <Text style={styles.metaValue}>{formatDate(project.deadline)}</Text>
                  </View>
                </View>
              ) : null}

              {project.client ? (
                <View style={styles.metaCard}>
                  <View style={styles.metaIconWrapper}>
                    <Ionicons name="person-outline" size={20} color="#6E6762" />
                  </View>
                  <View style={styles.metaTextCol}>
                    <Text style={styles.metaLabel}>Client</Text>
                    <Text style={styles.metaValue}>{project.client}</Text>
                  </View>
                </View>
              ) : null}

              {project.serviceTypeName ? (
                <View style={styles.metaCard}>
                  <View style={styles.metaIconWrapper}>
                    <Ionicons name="briefcase-outline" size={20} color="#6E6762" />
                  </View>
                  <View style={styles.metaTextCol}>
                    <Text style={styles.metaLabel}>Service Type</Text>
                    <Text style={styles.metaValue}>{project.serviceTypeName}</Text>
                  </View>
                </View>
              ) : null}

              {project.description ? (
                <View style={styles.metaCard}>
                  <View style={styles.metaIconWrapper}>
                    <Ionicons name="document-text-outline" size={20} color="#6E6762" />
                  </View>
                  <View style={styles.metaTextCol}>
                    <Text style={styles.metaLabel}>Description</Text>
                    <Text style={styles.metaValue}>{project.description}</Text>
                  </View>
                </View>
              ) : null}

              {project.rejectionReason ? (
                <View style={[styles.metaCard, styles.rejectionCard]}>
                  <View style={[styles.metaIconWrapper, { backgroundColor: "#FEE2E2" }]}>
                    <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
                  </View>
                  <View style={styles.metaTextCol}>
                    <Text style={[styles.metaLabel, { color: "#991B1B" }]}>
                      Rejection Reason
                    </Text>
                    <Text style={[styles.metaValue, { color: "#7F1D1D" }]}>
                      {project.rejectionReason}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* PHOTOS TAB */}
          {activeTab === "photos" ? (
            <View style={styles.tabContentArea}>
              {photos.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="images-outline" size={32} color="#A39A94" />
                  <Text style={styles.emptyCardText}>No photos uploaded yet.</Text>
                </View>
              ) : (
                <View style={styles.photosGrid}>
                  {photos.map((p, idx) => (
                    <View key={idx} style={styles.photoGridCard}>
                      <Image source={{ uri: p.url }} style={styles.photoGridImage} />
                      {p.caption || p.category ? (
                        <View style={styles.photoMetaOverlay}>
                          <Text style={styles.photoCaptionText} numberOfLines={1}>
                            {p.caption || p.category}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : null}

          {/* NOTES TAB */}
          {activeTab === "notes" ? (
            <View style={styles.tabContentArea}>
              {isLoadingNotes && notes.length === 0 ? (
                <View style={styles.emptyCard}>
                  <ActivityIndicator size="small" color="#6B5E54" />
                  <Text style={styles.emptyCardText}>Loading notes...</Text>
                </View>
              ) : notes.length > 0 ? (
                <View style={styles.notesListContainer}>
                  {notes.map((note, idx) => (
                    <View key={note._id || idx} style={styles.savedNoteCard}>
                      <View style={styles.savedNoteHeader}>
                        <Text style={styles.savedNoteAuthor}>
                          {note.authorName || "Vendor Note"}
                        </Text>
                        <Text style={styles.savedNoteTimestamp}>
                          {formatNoteDate(note.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.savedNoteText}>{note.text}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Ionicons name="journal-outline" size={32} color="#A39A94" />
                  <Text style={styles.emptyCardText}>No notes added yet.</Text>
                </View>
              )}

              {/* ADD NOTE INPUT & SAVE NOTE BUTTON */}
              <View style={styles.addNoteContainer}>
                <TextInput
                  style={styles.noteInputArea}
                  placeholder="Add a note..."
                  placeholderTextColor="#A39A94"
                  multiline={true}
                  numberOfLines={4}
                  value={newNoteText}
                  onChangeText={setNewNoteText}
                  textAlignVertical="top"
                />

                <Pressable
                  style={[
                    styles.saveNoteButton,
                    (!newNoteText.trim() || isSavingNote) && styles.disabledButton,
                  ]}
                  onPress={handleSaveNote}
                  disabled={!newNoteText.trim() || isSavingNote}
                  accessibilityRole="button"
                  accessibilityLabel="Save Note"
                >
                  {isSavingNote ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveNoteButtonText}>Save Note</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* BOTTOM PRIMARY ACTION AREA (Only visible in Overview tab) */}
          {activeTab !== "photos" && activeTab !== "notes" && (isAssignedOrNew || isInProgress) ? (
            <View style={styles.actionContainer}>
              {isAssignedOrNew ? (
                <Pressable
                  style={[styles.primaryActionButton, isAccepting && styles.disabledButton]}
                  onPress={handleAcceptProject}
                  disabled={isAccepting}
                  accessibilityRole="button"
                  accessibilityLabel="Accept Project"
                >
                  {isAccepting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryActionText}>Accept Project</Text>
                  )}
                </Pressable>
              ) : isInProgress ? (
                <View style={styles.actionRow}>
                  <Pressable
                    style={[styles.primaryActionButton, styles.primaryActionFlex]}
                    onPress={handleStartCapture}
                    accessibilityRole="button"
                    accessibilityLabel="Start Capture"
                  >
                    <Ionicons name="camera-outline" size={20} color="#FFFFFF" style={styles.btnIcon} />
                    <Text style={styles.primaryActionText}>Start Capture</Text>
                  </Pressable>

                  <Pressable
                    style={styles.timelineIconButton}
                    onPress={handleOpenTimeline}
                    accessibilityRole="button"
                    accessibilityLabel="Project Timeline"
                  >
                    <Ionicons name="time-outline" size={22} color="#4A423F" />
                  </Pressable>
                </View>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
};

export default ProjectDetailsScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingBottom: 100,
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
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  heroImageContainer: {
    height: 180,
    width: "100%",
    position: "relative",
    backgroundColor: "#F2EBE5",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAE4DF",
  },
  statusBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroBody: {
    padding: 16,
  },
  projectTitleText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1C1917",
    letterSpacing: -0.3,
  },
  projectNameSubtext: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5C524A",
    marginTop: 2,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#6E6762",
    fontWeight: "500",
    flex: 1,
  },
  tabBarContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: "#F3EFEA",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#817B77",
  },
  tabTextActive: {
    color: "#2C2724",
    fontWeight: "700",
  },
  tabContentArea: {
    paddingHorizontal: 16,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  progressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C2724",
  },
  progressRatioText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#817B77",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#F3EFEA",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#8A817C",
    borderRadius: 3,
  },
  checklistItemsContainer: {
    gap: 10,
  },
  checklistItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checklistIcon: {
    marginRight: 10,
  },
  checklistItemLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3E3734",
    flex: 1,
  },
  checklistItemLabelChecked: {
    color: "#6E6762",
  },
  metaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  rejectionCard: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  metaIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FAF7F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  metaTextCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#817B77",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C2724",
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EAE4DF",
    marginBottom: 12,
  },
  emptyCardText: {
    marginTop: 8,
    fontSize: 13,
    color: "#817B77",
    fontWeight: "500",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoGridCard: {
    width: "48%",
    height: 140,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F2EBE5",
    position: "relative",
  },
  photoGridImage: {
    width: "100%",
    height: "100%",
  },
  photoMetaOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoCaptionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
  },
  notesListContainer: {
    marginBottom: 12,
  },
  savedNoteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  savedNoteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  savedNoteAuthor: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A423F",
  },
  savedNoteTimestamp: {
    fontSize: 12,
    color: "#8C7E72",
    fontWeight: "500",
  },
  savedNoteText: {
    fontSize: 14,
    color: "#2C2724",
    lineHeight: 20,
  },
  addNoteContainer: {
    marginTop: 4,
  },
  noteInputArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAE4DF",
    padding: 14,
    fontSize: 14,
    color: "#2C2724",
    minHeight: 100,
    marginBottom: 14,
  },
  saveNoteButton: {
    backgroundColor: "#928880",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  saveNoteButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  notesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  noteBlock: {
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A423F",
    marginBottom: 4,
  },
  noteBody: {
    fontSize: 14,
    color: "#2C2724",
    lineHeight: 20,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  primaryActionFlex: {
    flex: 1,
  },
  primaryActionButton: {
    backgroundColor: "#928880",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  timelineIconButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE4DF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.7,
  },
  btnIcon: {
    marginRight: 8,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
