import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface VerificationCheckRowProps {
  title: string;
  detail: string;
  status: "passed" | "failed" | "pending" | "unavailable";
}

export const VerificationCheckRow: React.FC<VerificationCheckRowProps> = ({
  title,
  detail,
  status,
}) => {
  const getIconProps = () => {
    switch (status) {
      case "passed":
        return {
          name: "checkmark-circle" as const,
          color: "#10B981",
        };
      case "failed":
        return {
          name: "close-circle" as const,
          color: "#EF4444",
        };
      case "pending":
        return {
          name: "time" as const,
          color: "#F59E0B",
        };
      case "unavailable":
      default:
        return {
          name: "ellipse-outline" as const,
          color: "#9CA3AF",
        };
    }
  };

  const icon = getIconProps();

  return (
    <View style={styles.rowContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon.name} size={22} color={icon.color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.detailText} numberOfLines={2}>
          {detail}
        </Text>
      </View>
    </View>
  );
};

export default VerificationCheckRow;

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  iconContainer: {
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#18181B",
    marginBottom: 2,
  },
  detailText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
});
