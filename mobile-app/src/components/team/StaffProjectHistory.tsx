import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";

export const StaffProjectHistory: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Project History</Text>
      
      <View style={styles.emptyCard}>
        <View style={styles.iconCircle}>
          <Ionicons name="folder-open-outline" size={28} color="#9CA3AF" />
        </View>
        <Text style={styles.emptyTitle}>No project history available</Text>
        <Text style={styles.emptySubtitle}>
          Projects assigned to this staff member will appear here.
        </Text>
      </View>
    </View>
  );
};

export default StaffProjectHistory;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
});
