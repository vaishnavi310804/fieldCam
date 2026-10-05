import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";
import { VendorProjectItem } from "@/src/api/dashboard.api";

export interface ProjectAssignmentCardProps {
  project: VendorProjectItem;
  onSelect: (project: VendorProjectItem) => void;
}

export const ProjectAssignmentCard: React.FC<ProjectAssignmentCardProps> = ({
  project,
  onSelect,
}) => {
  const formattedDeadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const rawStatus = (project.status || "NEW").toUpperCase();
  const statusDisplay = rawStatus === "NEW" || rawStatus === "ASSIGNED" ? "AVAILABLE" : rawStatus;

  return (
    <Pressable
      style={styles.cardContainer}
      onPress={() => onSelect(project)}
      accessibilityRole="button"
      accessibilityLabel={`Assign project ${project.projectName}`}
    >
      {/* LEFT ICON CIRCLE / SQUARE */}
      <View style={styles.iconSquare}>
        <Ionicons name="construct-outline" size={20} color="#6B5E54" />
      </View>

      {/* MIDDLE CONTENT */}
      <View style={styles.contentContainer}>
        <Text style={styles.projectTitle} numberOfLines={1}>
          {project.projectName}
        </Text>

        <View style={styles.metaRow}>
          {formattedDeadline ? (
            <Text style={styles.metaText} numberOfLines={1}>
              Due: {formattedDeadline}
            </Text>
          ) : null}
          {project.client ? (
            <Text style={styles.metaText} numberOfLines={1}>
              {formattedDeadline ? " • " : ""}{project.client}
            </Text>
          ) : project.serviceTypeName ? (
            <Text style={styles.metaText} numberOfLines={1}>
              {formattedDeadline ? " • " : ""}{project.serviceTypeName}
            </Text>
          ) : null}
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{statusDisplay}</Text>
        </View>
      </View>

      {/* RIGHT CHEVRON */}
      <View style={styles.chevronBox}>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </View>
    </Pressable>
  );
};

export default ProjectAssignmentCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconSquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3EFEA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9CA3AF",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  chevronBox: {
    marginLeft: 8,
  },
});
