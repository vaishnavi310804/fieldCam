import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProjectApprovedBannerProps {
  projectCode: string;
  projectName?: string;
  location?: string;
  status?: string;
}

export const ProjectApprovedBanner: React.FC<ProjectApprovedBannerProps> = ({
  projectCode,
  projectName,
  location,
  status = "Approved",
}) => {
  const subtitle = location
    ? `${projectCode} — ${location}`
    : projectName
    ? `${projectCode} — ${projectName}`
    : projectCode;

  return (
    <View style={styles.card}>
      <View style={styles.leftContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={24} color="#00B894" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Project Approved</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.statusPill}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
};

export default ProjectApprovedBanner;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EAE5E1",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E6FBF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F1D1B",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8C827A",
  },
  statusPill: {
    backgroundColor: "#00B894",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});
