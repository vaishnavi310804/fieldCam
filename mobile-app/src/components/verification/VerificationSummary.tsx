import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type VerificationCardStatus =
  | "PASSED"
  | "FAILED"
  | "INCOMPLETE"
  | "PENDING";

export interface VerificationSummaryProps {
  status: VerificationCardStatus;
  reason?: string;
  categoryLabel?: string;
  title?: string;
  subtitle?: string;
  verifiedCount?: number;
  totalCount?: number;
  progressText?: string;
  currentPhotoCategory?: string;
  currentPhotoStatus?: "PASSED" | "FAILED" | "PENDING";
}

export const VerificationSummary: React.FC<VerificationSummaryProps> = ({
  status,
  reason,
  categoryLabel,
  title,
  subtitle,
  verifiedCount,
  totalCount,
  progressText,
  currentPhotoCategory,
  currentPhotoStatus,
}) => {
  const getSummaryConfig = () => {
    switch (status) {
      case "PASSED":
        return {
          color: "#10B981",
          bgColor: "#ECFDF5",
          borderColor: "#A7F3D0",
          icon: "checkmark-circle" as const,
          defaultTitle: "Validation Passed",
          defaultSubtitle:
            totalCount !== undefined
              ? `All ${totalCount} required checklist items passed AI verification and are ready for submission.`
              : "All checklist requirements passed AI verification and are ready for submission.",
        };
      case "FAILED":
        return {
          color: "#EF4444",
          bgColor: "#FEF2F2",
          borderColor: "#FECACA",
          icon: "close-circle" as const,
          defaultTitle: "Validation Failed",
          defaultSubtitle:
            reason ||
            (verifiedCount !== undefined && totalCount !== undefined
              ? `${verifiedCount} of ${totalCount} checklist items verified. One or more checklist photos failed AI verification.`
              : "One or more checklist items did not pass AI verification."),
        };
      case "INCOMPLETE":
      case "PENDING":
      default:
        return {
          color: "#D97706",
          bgColor: "#FFFBEB",
          borderColor: "#FDE68A",
          icon: "time-outline" as const,
          defaultTitle: "Verification Incomplete",
          defaultSubtitle:
            verifiedCount !== undefined && totalCount !== undefined
              ? `${verifiedCount} of ${totalCount} checklist items verified. Complete all checklist items before submitting for review.`
              : (reason || "AI verification is incomplete. All required checklist items must pass before submission."),
        };
    }
  };

  const config = getSummaryConfig();
  const displayTitle = title || config.defaultTitle;
  const displaySubtitle = subtitle || config.defaultSubtitle;
  const showCurrentPhotoPassedNote =
    currentPhotoStatus === "PASSED" && status !== "PASSED";

  return (
    <View style={styles.cardContainer}>
      {/* Outer Circular Ring Icon Container */}
      <View
        style={[
          styles.iconRing,
          { backgroundColor: config.bgColor, borderColor: config.borderColor },
        ]}
      >
        <Ionicons name={config.icon} size={36} color={config.color} />
      </View>

      {/* Primary Result Title */}
      <Text style={[styles.titleText, { color: config.color }]}>
        {displayTitle}
      </Text>

      {/* Progress Chip if counts provided */}
      {verifiedCount !== undefined && totalCount !== undefined && totalCount > 0 && (
        <View
          style={[
            styles.progressChip,
            { borderColor: config.borderColor, backgroundColor: config.bgColor },
          ]}
        >
          <Ionicons
            name={status === "PASSED" ? "checkmark-circle" : "checkbox-outline"}
            size={13}
            color={config.color}
          />
          <Text style={[styles.progressChipText, { color: config.color }]}>
            {progressText || `${verifiedCount} of ${totalCount} checklist items ready`}
          </Text>
        </View>
      )}

      {/* Subtitle / Reason Text */}
      <Text style={styles.subtitleText}>
        {categoryLabel && status === "PASSED" ? `Category: ${categoryLabel}\n` : ""}
        {displaySubtitle}
      </Text>

      {/* Note indicating current photo passed when overall work order is incomplete or failed */}
      {showCurrentPhotoPassedNote && (
        <View style={styles.currentPhotoPassedBanner}>
          <Ionicons name="checkmark-circle" size={15} color="#059669" />
          <Text style={styles.currentPhotoPassedText}>
            Selected photo ({currentPhotoCategory || "Current"}) passed AI checks
          </Text>
        </View>
      )}
    </View>
  );
};

export default VerificationSummary;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginBottom: 12,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  progressChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  progressChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  subtitleText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  currentPhotoPassedBanner: {
    marginTop: 12,
    width: "100%",
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  currentPhotoPassedText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#065F46",
  },
});
