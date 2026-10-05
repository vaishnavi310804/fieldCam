import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/src/constants/color";

export const ProjectAssignedScreen: React.FC = () => {
  const router = useRouter();
  const { projectName, staffName } = useLocalSearchParams<{
    projectName?: string;
    staffName?: string;
  }>();

  const displayProjectName = projectName || "The project";
  const displayStaffName = staffName || "the staff member";

  const handleDone = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/team" as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        {/* SUCCESS CHECKMARK ICON CIRCLE */}
        <View style={styles.iconCircleBackground}>
          <Ionicons name="checkmark-circle" size={56} color="#0284C7" />
        </View>

        {/* TITLE */}
        <Text style={styles.titleText}>Project Assigned!</Text>

        {/* DESCRIPTION BODY */}
        <Text style={styles.descriptionText}>
          <Text style={styles.highlightText}>{displayProjectName}</Text> has been
          successfully assigned to{" "}
          <Text style={styles.highlightText}>{displayStaffName}</Text>.
        </Text>
      </View>

      {/* BOTTOM BUTTON */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.doneButton}
          onPress={handleDone}
          accessibilityRole="button"
          accessibilityLabel="Done and return to team"
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ProjectAssignedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingBottom:80
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  iconCircleBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
    textAlign: "center",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  highlightText: {
    fontWeight: "700",
    color: "#374151",
  },
  bottomBar: {
    paddingBottom: 40,
    width: "100%",
  },
  doneButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
