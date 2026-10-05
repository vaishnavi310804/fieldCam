import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "@/src/constants/color";
import { VendorStaffItem } from "@/src/api/dashboard.api";

export interface StaffDetailsActionsProps {
  staff: VendorStaffItem;
  onRefreshNeeded?: () => void;
}

export const StaffDetailsActions: React.FC<StaffDetailsActionsProps> = ({
  staff,
}) => {
  const router = useRouter();
  const [assignLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const rawStatus = (staff.status || "ACTIVE").toLowerCase();
  const isActive = rawStatus === "active";

  const handleAssignProject = () => {
    if (assignLoading || editLoading || statusLoading) return;
    router.push({
      pathname: "/(app)/assign-project",
      params: { staffId: staff._id },
    });
  };

  const handleEditProfile = () => {
    if (assignLoading || editLoading || statusLoading) return;
    setEditLoading(true);
    setTimeout(() => {
      setEditLoading(false);
      Alert.alert(
        "Edit Profile",
        "Editing staff member profile details requires backend staff update endpoint support."
      );
    }, 300);
  };

  const handleToggleStatus = () => {
    if (assignLoading || editLoading || statusLoading) return;
    setStatusLoading(true);
    const actionText = isActive ? "Deactivate" : "Activate";

    setTimeout(() => {
      setStatusLoading(false);
      Alert.alert(
        `${actionText} Staff`,
        `Staff account ${actionText.toLowerCase()} requires backend status update endpoint support.`
      );
    }, 300);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Actions</Text>

      {/* ASSIGN PROJECT BUTTON */}
      <Pressable
        style={[styles.actionButton, styles.primaryButton]}
        onPress={handleAssignProject}
        disabled={assignLoading || editLoading || statusLoading}
        accessibilityRole="button"
        accessibilityLabel="Assign Project"
      >
        {assignLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="briefcase-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Assign Project</Text>
          </>
        )}
      </Pressable>

      {/* SECONDARY ACTIONS ROW */}
      <View style={styles.secondaryRow}>
        <Pressable
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleEditProfile}
          disabled={assignLoading || editLoading || statusLoading}
          accessibilityRole="button"
          accessibilityLabel="Edit Details"
        >
          {editLoading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <>
              <Ionicons name="create-outline" size={18} color="#3B82F6" />
              <Text style={styles.editButtonText}>Edit Details</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[
            styles.actionButton,
            styles.secondaryButton,
            isActive ? styles.deactivateBorder : styles.activateBorder,
          ]}
          onPress={handleToggleStatus}
          disabled={assignLoading || editLoading || statusLoading}
          accessibilityRole="button"
          accessibilityLabel={isActive ? "Deactivate Staff" : "Activate Staff"}
        >
          {statusLoading ? (
            <ActivityIndicator
              size="small"
              color={isActive ? "#EF4444" : "#16A34A"}
            />
          ) : (
            <>
              <Ionicons
                name={isActive ? "power-outline" : "checkmark-circle-outline"}
                size={18}
                color={isActive ? "#EF4444" : "#16A34A"}
              />
              <Text
                style={[
                  styles.statusButtonText,
                  isActive ? styles.deactivateText : styles.activateText,
                ]}
              >
                {isActive ? "Deactivate" : "Activate"}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default StaffDetailsActions;

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    marginBottom: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  editButtonText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },
  deactivateBorder: {
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
  },
  activateBorder: {
    borderColor: "#DCFCE7",
    backgroundColor: "#F0FDF4",
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  deactivateText: {
    color: "#EF4444",
  },
  activateText: {
    color: "#16A34A",
  },
});
