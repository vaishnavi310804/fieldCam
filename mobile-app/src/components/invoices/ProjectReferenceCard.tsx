import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProjectReferenceCardProps {
  workOrder: string;
  propertyAddress: string;
  clientName: string;
  completedDate?: string;
}

export const ProjectReferenceCard: React.FC<ProjectReferenceCardProps> = ({
  workOrder,
  propertyAddress,
  clientName,
  completedDate,
}) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Ionicons name="briefcase-outline" size={17} color="#6E655F" />
        <Text style={styles.sectionTitle}>Project Reference</Text>
      </View>

      <View style={styles.rowsContainer}>
        {/* Work Order */}
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Ionicons name="pricetag-outline" size={16} color="#8C827A" />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.rowLabel}>Work Order</Text>
            <Text style={styles.rowValue}>{workOrder || "—"}</Text>
          </View>
        </View>

        {/* Property Address */}
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Ionicons name="business-outline" size={16} color="#8C827A" />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.rowLabel}>Property</Text>
            <Text style={styles.rowValue}>{propertyAddress || "—"}</Text>
          </View>
        </View>

        {/* Client */}
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-outline" size={16} color="#8C827A" />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.rowLabel}>Client</Text>
            <Text style={styles.rowValue}>{clientName || "—"}</Text>
          </View>
        </View>

        {/* Completed / Deadline Date */}
        <View style={[styles.row, styles.lastRow]}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar-outline" size={16} color="#8C827A" />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.rowLabel}>Completed</Text>
            <Text style={styles.rowValue}>{formatDate(completedDate)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProjectReferenceCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EAE5E1",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  rowsContainer: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastRow: {
    marginBottom: 0,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F4ECE6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#8C827A",
    marginBottom: 1,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F1D1B",
  },
});
