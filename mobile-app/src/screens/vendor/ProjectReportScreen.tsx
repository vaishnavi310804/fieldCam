import React, { useCallback, useEffect, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import Colors from "@/src/constants/color";
import {
  downloadProjectReportPdf,
  getProjectById,
  VendorProjectItem,
} from "@/src/api/dashboard.api";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import { ProjectReportSummary } from "@/src/components/reports/ProjectReportSummary";
import { ReportWorkSummary } from "@/src/components/reports/ReportWorkSummary";
import { ReportPhotoEvidence } from "@/src/components/reports/ReportPhotoEvidence";
import { ReportNotesSection } from "@/src/components/reports/ReportNotesSection";

export const ProjectReportScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<VendorProjectItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectData = useCallback(
    async (showLoading = true) => {
      if (!projectId) {
        setError("Invalid project ID.");
        setIsLoading(false);
        return;
      }

      try {
        if (showLoading) setIsLoading(true);
        setError(null);
        const data = await getProjectById(projectId);
        setProject(data);
      } catch (err: any) {
        console.error("Failed to fetch project report details:", err);
        setError(err?.message || "Failed to load project report details.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [projectId]
  );

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProjectData(false);
  };

  const handleDownloadPdf = async () => {
    if (!projectId) return;

    try {
      setIsDownloadingPdf(true);
      const arrayBuffer = await downloadProjectReportPdf(projectId);

      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 =
        typeof btoa !== "undefined"
          ? btoa(binary)
          : (global as any).btoa(binary);

      const safeFilename = `FieldCam_Project_${project?.projectId || projectId}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${safeFilename}`;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
        });
      } else {
        Alert.alert("Report Downloaded", `PDF saved to:\n${fileUri}`);
      }
    } catch (err: any) {
      console.error("Failed to download project report PDF:", err);
      Alert.alert(
        "Download Failed",
        err?.message || "Failed to download project report PDF."
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleShare = () => {
    handleDownloadPdf();
  };

  const handleSendToClient = () => {
    Alert.alert("Send to Client", "Direct client report delivery will be available soon.");
  };

  const statusUpper = (project?.status || "").toUpperCase();
  const isApproved = statusUpper === "APPROVED" || statusUpper === "COMPLETED";

  const formattedApprovalDate = project?.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <View style={styles.screenContainer}>
      <PageHeader
        title="Project Report"
        showBackButton={true}
        onBackPress={() => router.back()}
        rightElement={
          <Pressable
            style={styles.headerShareButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share report"
          >
            <Ionicons name="share-outline" size={20} color="#1A1A1A" />
          </Pressable>
        }
      />

      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading project report...</Text>
        </View>
      ) : error || !project ? (
        <View style={styles.centerContainer}>
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
            <Text style={styles.errorTitle}>Unable to Load Report</Text>
            <Text style={styles.errorText}>{error || "Project report not found."}</Text>
            <Pressable style={styles.retryButton} onPress={() => fetchProjectData()}>
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
          {/* TOP REPORT STATUS BANNER */}
          <View style={styles.statusBannerCard}>
            <View style={styles.bannerLeft}>
              <View style={[styles.statusIconBadge, isApproved && styles.statusIconApproved]}>
                <Ionicons
                  name={isApproved ? "checkmark-circle" : "time"}
                  size={24}
                  color={isApproved ? "#16A34A" : "#D97706"}
                />
              </View>
              <View style={styles.bannerTextCol}>
                <Text style={styles.bannerTitle}>
                  {isApproved ? "Report Approved" : `Report ${project.status}`}
                </Text>
                <Text style={styles.bannerSubtext}>
                  {isApproved && formattedApprovalDate
                    ? `Approved on ${formattedApprovalDate}`
                    : `Status: ${project.status}`}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadgePill,
                { backgroundColor: isApproved ? "#DCFCE7" : "#FEF9C3" },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgePillText,
                  { color: isApproved ? "#166534" : "#854D0E" },
                ]}
              >
                {project.status}
              </Text>
            </View>
          </View>

          {/* PROJECT SUMMARY SECTION */}
          <ProjectReportSummary project={project} />

          {/* WORK SUMMARY METRICS GRID */}
          <ReportWorkSummary project={project} />

          {/* PHOTO EVIDENCE SECTION */}
          <ReportPhotoEvidence photos={project.photos} />

          {/* NOTES & OBSERVATIONS SECTION */}
          <ReportNotesSection notes={project.notes} />

          {/* REPORT ACTIONS SECTION */}
          <View style={styles.actionsSection}>
            <View style={styles.actionsHeaderRow}>
              <Ionicons name="document-text-outline" size={18} color="#374151" />
              <Text style={styles.actionsTitle}>Report Actions</Text>
            </View>

            {/* Download Report (PDF) */}
            <Pressable
              style={[
                styles.primaryActionButton,
                isDownloadingPdf && styles.disabledButton,
              ]}
              onPress={handleDownloadPdf}
              disabled={isDownloadingPdf}
              accessibilityRole="button"
              accessibilityLabel="Download Report PDF"
            >
              {isDownloadingPdf ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              )}
              <Text style={styles.primaryActionText}>
                {isDownloadingPdf ? "Generating PDF..." : "Download Report (PDF)"}
              </Text>
            </Pressable>

            {/* Share Report */}
            <Pressable
              style={styles.secondaryActionButton}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Share Report"
            >
              <Ionicons name="share-social-outline" size={18} color="#374151" />
              <Text style={styles.secondaryActionText}>Share Report</Text>
            </Pressable>

            {/* Send to Client */}
            <Pressable
              style={styles.secondaryActionButton}
              onPress={handleSendToClient}
              accessibilityRole="button"
              accessibilityLabel="Send Report to Client"
            >
              <Ionicons name="send-outline" size={18} color="#374151" />
              <Text style={styles.secondaryActionText}>Send to Client</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default ProjectReportScreen;

const styles = StyleSheet.create({
  screenContainer: {
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
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: Colors.gray,
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DC2626",
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: "#6B7280",
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

  /* STATUS BANNER */
  statusBannerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  statusIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  statusIconApproved: {
    backgroundColor: "#DCFCE7",
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  bannerSubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  statusBadgePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgePillText: {
    fontSize: 12,
    fontWeight: "700",
  },

  /* ACTIONS SECTION */
  actionsSection: {
    marginBottom: 24,
    gap: 10,
  },
  actionsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  primaryActionButton: {
    backgroundColor: "#8C7E74",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryActionButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryActionText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
  },
});
