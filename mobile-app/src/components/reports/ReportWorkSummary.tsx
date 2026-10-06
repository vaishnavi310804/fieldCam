import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VendorProjectItem } from "@/src/api/dashboard.api";

const { width } = Dimensions.get("window");

export interface ReportWorkSummaryProps {
  project: VendorProjectItem;
}

export const ReportWorkSummary = ({ project }: ReportWorkSummaryProps) => {
  const photos = Array.isArray(project.photos) ? project.photos : [];
  const photosCount = photos.length;

  // 1. AI Quality Score calculation from real AI validation data
  let totalVerified = 0;
  let passedCount = 0;

  photos.forEach((p) => {
    if (p.aiValidation) {
      totalVerified++;
      if (p.aiValidation.status === "PASSED") {
        passedCount++;
      }
    }
  });

  const aiScoreText =
    totalVerified > 0 ? `${Math.round((passedCount / totalVerified) * 100)}%` : "N/A";

  // 2. Location Verified calculation from real GPS photo metadata
  const hasGpsLocation = photos.some(
    (p) =>
      p.location &&
      typeof p.location.latitude === "number" &&
      typeof p.location.longitude === "number"
  );
  const locationVerifiedText = hasGpsLocation ? "Confirmed" : "N/A";

  // 3. Work Duration calculation from real timestamps
  let durationText = "N/A";
  if (project.createdAt && (project.updatedAt || photos.length > 0)) {
    const start = new Date(project.createdAt).getTime();
    const end = project.updatedAt
      ? new Date(project.updatedAt).getTime()
      : photos[photos.length - 1]?.capturedAt
      ? new Date(photos[photos.length - 1].capturedAt!).getTime()
      : start;

    if (end > start) {
      const durationMs = end - start;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const mins = Math.round((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours === 0) {
        durationText = `${mins}m`;
      } else if (hours < 24) {
        durationText = `${hours}h ${mins}m`;
      } else {
        const days = (hours / 24).toFixed(1);
        durationText = `${days} days`;
      }
    }
  }

  const cardWidth = (width - 44) / 2;

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <Ionicons name="shield-checkmark-outline" size={18} color="#374151" />
        <Text style={styles.sectionTitle}>Work Summary</Text>
      </View>

      <View style={styles.grid}>
        {/* Photos Uploaded */}
        <View style={[styles.card, { width: cardWidth }]}>
          <View style={[styles.iconBadge, { backgroundColor: "#FEE2E2" }]}>
            <Ionicons name="camera-outline" size={18} color="#DC2626" />
          </View>
          <Text style={styles.valueText}>{photosCount}</Text>
          <Text style={styles.labelText}>Photos Uploaded</Text>
        </View>

        {/* AI Quality Score */}
        <View style={[styles.card, { width: cardWidth }]}>
          <View style={[styles.iconBadge, { backgroundColor: "#DCFCE7" }]}>
            <Ionicons name="shield-outline" size={18} color="#16A34A" />
          </View>
          <Text style={styles.valueText}>{aiScoreText}</Text>
          <Text style={styles.labelText}>AI Quality Score</Text>
        </View>

        {/* Location Verified */}
        <View style={[styles.card, { width: cardWidth }]}>
          <View style={[styles.iconBadge, { backgroundColor: "#DBEAFE" }]}>
            <Ionicons name="location-outline" size={18} color="#2563EB" />
          </View>
          <Text style={styles.valueText}>{locationVerifiedText}</Text>
          <Text style={styles.labelText}>Location Verified</Text>
        </View>

        {/* Work Duration */}
        <View style={[styles.card, { width: cardWidth }]}>
          <View style={[styles.iconBadge, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="time-outline" size={18} color="#D97706" />
          </View>
          <Text style={styles.valueText}>{durationText}</Text>
          <Text style={styles.labelText}>Work Duration</Text>
        </View>
      </View>
    </View>
  );
};

export default ReportWorkSummary;

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  valueText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  labelText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
  },
});
