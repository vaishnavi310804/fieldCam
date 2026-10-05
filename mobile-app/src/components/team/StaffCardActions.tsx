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
import { VendorStaffItem, VendorTeamMemberItem } from "@/src/api/dashboard.api";

export interface StaffCardActionsProps {
  member: VendorStaffItem | VendorTeamMemberItem;
  onRefreshNeeded?: () => void;
}

export const StaffCardActions: React.FC<StaffCardActionsProps> = ({
  member,
  onRefreshNeeded,
}) => {
  const router = useRouter();
  const [assignLoading] = useState(false);
  const [editLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const rawStatus = (
    member.status ||
    (member as VendorTeamMemberItem).userId?.status ||
    "ACTIVE"
  ).toLowerCase();
  const isActive = rawStatus === "active";

  const handleAssignProject = () => {
    if (assignLoading || editLoading || statusLoading) return;
    router.push({
      pathname: "/(app)/assign-project",
      params: { staffId: member._id },
    });
  };

  const handleEditDetails = () => {
    if (assignLoading || editLoading || statusLoading) return;
    router.push({
      pathname: "/(app)/staff-details",
      params: { id: member._id },
    });
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
    <View style={styles.actionsContainer}>
      {/* 1. ASSIGN PROJECT ACTION */}
      <Pressable
        style={styles.actionCard}
        onPress={handleAssignProject}
        disabled={assignLoading || editLoading || statusLoading}
        accessibilityRole="button"
        accessibilityLabel="Assign Project"
      >
        <View style={[styles.iconCircle, styles.assignIconBg]}>
          {assignLoading ? (
            <ActivityIndicator size="small" color="#C87A65" />
          ) : (
            <Ionicons name="briefcase-outline" size={18} color="#C87A65" />
          )}
        </View>
        <Text style={styles.actionLabel} numberOfLines={1}>
          Assign Project
        </Text>
      </Pressable>

      {/* 2. EDIT DETAILS ACTION */}
      <Pressable
        style={styles.actionCard}
        onPress={handleEditDetails}
        disabled={assignLoading || editLoading || statusLoading}
        accessibilityRole="button"
        accessibilityLabel="Edit Details"
      >
        <View style={[styles.iconCircle, styles.editIconBg]}>
          {editLoading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Ionicons name="create-outline" size={18} color="#3B82F6" />
          )}
        </View>
        <Text style={styles.actionLabel} numberOfLines={1}>
          Edit Details
        </Text>
      </Pressable>

      {/* 3. ACTIVATE / DEACTIVATE ACTION */}
      <Pressable
        style={styles.actionCard}
        onPress={handleToggleStatus}
        disabled={assignLoading || editLoading || statusLoading}
        accessibilityRole="button"
        accessibilityLabel={isActive ? "Deactivate Staff" : "Activate Staff"}
      >
        <View
          style={[
            styles.iconCircle,
            isActive ? styles.deactivateIconBg : styles.activateIconBg,
          ]}
        >
          {statusLoading ? (
            <ActivityIndicator
              size="small"
              color={isActive ? "#EF4444" : "#16A34A"}
            />
          ) : (
            <Ionicons
              name={isActive ? "power-outline" : "checkmark-circle-outline"}
              size={18}
              color={isActive ? "#EF4444" : "#16A34A"}
            />
          )}
        </View>
        <Text
          style={[
            styles.actionLabel,
            isActive ? styles.deactivateLabelText : styles.activateLabelText,
          ]}
          numberOfLines={1}
        >
          {isActive ? "Deactivate" : "Activate"}
        </Text>
      </Pressable>
    </View>
  );
};

export default StaffCardActions;

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  assignIconBg: {
    backgroundColor: "#FCECE7",
  },
  editIconBg: {
    backgroundColor: "#E0F2FE",
  },
  activateIconBg: {
    backgroundColor: "#DCFCE7",
  },
  deactivateIconBg: {
    backgroundColor: "#FEE2E2",
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  activateLabelText: {
    color: "#16A34A",
  },
  deactivateLabelText: {
    color: "#EF4444",
  },
});
