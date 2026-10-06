import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VendorProjectItem } from "@/src/api/dashboard.api";
import { getProjectProgress } from "@/src/utils/projectProgress";

export interface ProjectReportCardProps {
  project: VendorProjectItem;
  onPress?: () => void;
}

const getStatusConfig = (statusRaw?: string) => {
  const status = (statusRaw || "").toUpperCase();
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return { label: "Completed", color: "#16A34A" };
    case "SUBMITTED":
    case "UNDER REVIEW":
    case "IN REVIEW":
      return { label: "In Review", color: "#D97706" };
    case "IN PROGRESS":
      return { label: "In Progress", color: "#2563EB" };
    case "NEW":
    case "ASSIGNED":
      return { label: "Pending", color: "#4F46E5" };
    case "REJECTED":
      return { label: "Rejected", color: "#DC2626" };
    default:
      return { label: statusRaw || "Assigned", color: "#6B7280" };
  }
};

const calculateProgress = (project: VendorProjectItem): number => {
  return getProjectProgress(
    project.status,
    project.checklistItems,
    project.progress
  );
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const ProjectReportCard = ({ project, onPress }: ProjectReportCardProps) => {
  const statusConfig = getStatusConfig(project.status);
  const progress = calculateProgress(project);
  const formattedDate = formatDate(project.deadline || project.createdAt);

  const reportTypeName = project.serviceTypeName || "Project Report";
  const locationText = project.location || project.projectName || "Location N/A";

  return (
    <Pressable
      style={styles.cardContainer}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Report for ${locationText}`}
    >
      {/* TOP ROW: Status Indicator + Report Document Icon */}
      <View style={styles.topRow}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        <View style={styles.documentIconBadge}>
          <Ionicons name="document-text-outline" size={18} color="#6B7280" />
        </View>
      </View>

      {/* MAIN ROW: Project Address / Location */}
      <Text style={styles.locationTitle} numberOfLines={1}>
        {locationText}
      </Text>

      {/* SUB INFORMATION ROW: Report Type + Date */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="document-text-outline" size={14} color="#9CA3AF" />
          <Text style={styles.infoText} numberOfLines={1}>
            {reportTypeName}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text style={styles.infoText}>{formattedDate}</Text>
        </View>
      </View>

      {/* BOTTOM ROW: Progress Bar & Progress Percentage */}
      {progress !== null ? (
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{progress}%</Text>
        </View>
      ) : (
        <View style={styles.progressRow}>
          <View style={styles.progressTrack} />
          <Text style={styles.progressPercent}>N/A</Text>
        </View>
      )}
    </Pressable>
  );
};

export default ProjectReportCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  documentIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 14,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    minWidth: 36,
    textAlign: "right",
  },
});
