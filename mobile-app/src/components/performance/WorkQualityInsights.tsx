import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";

export interface WorkQualityInsightsProps {
  aiQualityScore: number | null;
  totalPhotosVerified: number;
}

export const WorkQualityInsights: React.FC<WorkQualityInsightsProps> = ({
  aiQualityScore,
  totalPhotosVerified,
}) => {
  const displayScore =
    aiQualityScore !== null ? `${aiQualityScore}%` : "N/A";

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Work Quality Insights</Text>

      {/* AI IMAGE QUALITY SCORE CARD */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#C87A65" />
          </View>
          <View style={styles.titleContent}>
            <Text style={styles.scoreLabel}>AI Image Quality Score</Text>
            <Text style={styles.scoreValue}>{displayScore}</Text>
          </View>
        </View>

        {aiQualityScore !== null ? (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.max(0, aiQualityScore))}%` },
              ]}
            />
          </View>
        ) : null}

        <Text style={styles.verifiedCountText}>
          Based on {totalPhotosVerified} AI-verified photo upload(s)
        </Text>
      </View>
    </View>
  );
};

export default WorkQualityInsights;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  scoreCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FCECE7",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContent: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.black,
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#C87A65",
    borderRadius: 4,
  },
  verifiedCountText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});
