import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VendorProjectItem } from "@/src/api/dashboard.api";

export interface ProjectReportSummaryProps {
  project: VendorProjectItem;
}

const getStatusBadgeConfig = (statusRaw?: string) => {
  const status = (statusRaw || "").toUpperCase();
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return { label: "Approved", bg: "#DCFCE7", text: "#166534", dot: "#16A34A" };
    case "SUBMITTED":
    case "UNDER REVIEW":
    case "IN REVIEW":
      return { label: "Under Review", bg: "#F3E8FF", text: "#6B21A8", dot: "#7C3AED" };
    case "IN PROGRESS":
      return { label: "In Progress", bg: "#FEF9C3", text: "#854D0E", dot: "#CA8A04" };
    case "NEW":
    case "ASSIGNED":
      return { label: "Assigned", bg: "#DBEAFE", text: "#1E40AF", dot: "#2563EB" };
    case "REJECTED":
      return { label: "Rejected", bg: "#FEE2E2", text: "#991B1B", dot: "#DC2626" };
    default:
      return { label: statusRaw || "Assigned", bg: "#F3F4F6", text: "#374151", dot: "#6B7280" };
  }
};

const formatDateWithTime = (dateStr?: string): string => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "N/A";
  const dateFormatted = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFormatted = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateFormatted} — ${timeFormatted}`;
};

export const ProjectReportSummary = ({ project }: ProjectReportSummaryProps) => {
  const statusBadge = getStatusBadgeConfig(project.status);
  const completionDateText = formatDateWithTime(project.updatedAt || project.createdAt);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Ionicons name="document-text-outline" size={18} color="#374151" />
        <Text style={styles.cardTitle}>Project Summary</Text>
      </View>

      <View style={styles.rowsList}>
        {/* Project Name */}
        <View style={styles.summaryRow}>
          <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
            <Ionicons name="briefcase-outline" size={16} color="#DC2626" />
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={styles.label}>Project Name</Text>
            <Text style={styles.valueText} numberOfLines={1}>
              {project.projectName || "N/A"}
            </Text>
          </View>
        </View>

        {/* Work Order ID */}
        <View style={styles.summaryRow}>
          <View style={[styles.iconCircle, { backgroundColor: "#FFEDD5" }]}>
            <Ionicons name="pricetag-outline" size={16} color="#EA580C" />
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={styles.label}>Work Order ID</Text>
            <Text style={styles.valueText}>{project.projectId || "N/A"}</Text>
          </View>
        </View>

        {/* Property Address */}
        <View style={styles.summaryRow}>
          <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="location-outline" size={16} color="#D97706" />
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={styles.label}>Property Address</Text>
            <Text style={styles.valueText} numberOfLines={2}>
              {project.location || "Location N/A"}
            </Text>
          </View>
        </View>

        {/* Client Name */}
        {project.client ? (
          <View style={styles.summaryRow}>
            <View style={[styles.iconCircle, { backgroundColor: "#E0E7FF" }]}>
              <Ionicons name="person-outline" size={16} color="#4F46E5" />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.label}>Client Name</Text>
              <Text style={styles.valueText}>{project.client}</Text>
            </View>
          </View>
        ) : null}

        {/* Vendor Name */}
        {project.vendorName ? (
          <View style={styles.summaryRow}>
            <View style={[styles.iconCircle, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="business-outline" size={16} color="#9333EA" />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.label}>Vendor Name</Text>
              <Text style={styles.valueText}>{project.vendorName}</Text>
            </View>
          </View>
        ) : null}

        {/* Completion / Update Date */}
        <View style={styles.summaryRow}>
          <View style={[styles.iconCircle, { backgroundColor: "#DCFCE7" }]}>
            <Ionicons name="calendar-outline" size={16} color="#16A34A" />
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={styles.label}>Completion Date</Text>
            <Text style={styles.valueText}>{completionDateText}</Text>
          </View>
        </View>

        {/* Project Status */}
        <View style={styles.summaryRow}>
          <View style={[styles.iconCircle, { backgroundColor: "#E0F2FE" }]}>
            <Ionicons name="checkmark-done-circle-outline" size={16} color="#0284C7" />
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={styles.label}>Project Status</Text>
            <View style={styles.statusBadgeRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: statusBadge.dot }]} />
                <Text style={[styles.statusBadgeText, { color: statusBadge.text }]}>
                  {statusBadge.label}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProjectReportSummary;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  rowsList: {
    gap: 14,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTextContainer: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  valueText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginTop: 2,
  },
  statusBadgeRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
