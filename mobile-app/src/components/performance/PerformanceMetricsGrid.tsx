import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";

const { width } = Dimensions.get("window");
const cardWidth = (width - 42) / 2;

export interface PerformanceMetricsGridProps {
  completedCount: number;
  rejectedCount: number;
  approvalRate: number | null;
  avgCompletionTimeText: string;
  photosUploadedCount: number;
  activeProjectsCount: number;
}

export const PerformanceMetricsGrid: React.FC<PerformanceMetricsGridProps> = ({
  completedCount,
  rejectedCount,
  approvalRate,
  avgCompletionTimeText,
  photosUploadedCount,
  activeProjectsCount,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="flash-outline" size={16} color={Colors.black} />
          <Text style={styles.sectionTitle}>Key Performance Metrics</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {/* 1. TOTAL PROJECTS COMPLETED */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBadge, styles.greenBadge]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
            </View>
          </View>
          <Text style={styles.metricValue}>{completedCount}</Text>
          <Text style={styles.metricLabel}>Total Projects Completed</Text>
        </View>

        {/* 2. PROJECTS REJECTED */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBadge, styles.redBadge]}>
              <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
            </View>
          </View>
          <Text style={styles.metricValue}>{rejectedCount}</Text>
          <Text style={styles.metricLabel}>Projects Rejected</Text>
        </View>

        {/* 3. APPROVAL RATE */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBadge, styles.amberBadge]}>
              <Ionicons name="thumbs-up-outline" size={18} color="#D97706" />
            </View>
          </View>
          <Text style={styles.metricValue}>
            {approvalRate !== null ? `${approvalRate}%` : "N/A"}
          </Text>
          <Text style={styles.metricLabel}>Approval Rate</Text>
        </View>

        {/* 4. AVG COMPLETION TIME */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBadge, styles.blueBadge]}>
              <Ionicons name="time-outline" size={18} color="#0284C7" />
            </View>
          </View>
          <Text style={styles.metricValue}>{avgCompletionTimeText}</Text>
          <Text style={styles.metricLabel}>Avg. Completion Time</Text>
        </View>

        {/* 5. PHOTOS UPLOADED */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBadge, styles.purpleBadge]}>
              <Ionicons name="images-outline" size={18} color="#9333EA" />
            </View>
          </View>
          <Text style={styles.metricValue}>
            {photosUploadedCount.toLocaleString()}
          </Text>
          <Text style={styles.metricLabel}>Photos Uploaded</Text>
        </View>

        {/* 6. ACTIVE PROJECTS */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBadge, styles.yellowBadge]}>
              <Ionicons name="briefcase-outline" size={18} color="#CA8A04" />
            </View>
          </View>
          <Text style={styles.metricValue}>{activeProjectsCount}</Text>
          <Text style={styles.metricLabel}>Active Projects</Text>
        </View>
      </View>
    </View>
  );
};

export default PerformanceMetricsGrid;

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: cardWidth,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  greenBadge: { backgroundColor: "#DCFCE7" },
  redBadge: { backgroundColor: "#FEE2E2" },
  amberBadge: { backgroundColor: "#FEF3C7" },
  blueBadge: { backgroundColor: "#E0F2FE" },
  purpleBadge: { backgroundColor: "#F3E8FF" },
  yellowBadge: { backgroundColor: "#FEF9C3" },
  metricValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.black,
  },
  metricLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
  },
});
