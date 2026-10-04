import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface VerificationSummaryProps {
  status: "PASSED" | "FAILED" | "PENDING";
  reason?: string;
  categoryLabel?: string;
}

export const VerificationSummary: React.FC<VerificationSummaryProps> = ({
  status,
  reason,
  categoryLabel,
}) => {
  const getSummaryConfig = () => {
    switch (status) {
      case "PASSED":
        return {
          color: "#10B981",
          bgColor: "#ECFDF5",
          borderColor: "#A7F3D0",
          icon: "checkmark-circle" as const,
          title: "Validation Passed",
          subtitle: reason || "Image meets all quality and subject category requirements",
        };
      case "FAILED":
        return {
          color: "#EF4444",
          bgColor: "#FEF2F2",
          borderColor: "#FECACA",
          icon: "close-circle" as const,
          title: "Validation Failed",
          subtitle: reason || "Image did not pass AI quality checks. Please review details below.",
        };
      case "PENDING":
      default:
        return {
          color: "#F59E0B",
          bgColor: "#FFFBEB",
          borderColor: "#FDE68A",
          icon: "time" as const,
          title: "Validation Pending",
          subtitle: reason || "AI verification is currently processing this inspection photo",
        };
    }
  };

  const config = getSummaryConfig();

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
        {config.title}
      </Text>

      {/* Subtitle / Reason Text */}
      <Text style={styles.subtitleText}>
        {categoryLabel ? `Category: ${categoryLabel}\n` : ""}
        {config.subtitle}
      </Text>
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
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
});
