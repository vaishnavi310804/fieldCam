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
import {
  updateVendorStaffStatus,
  VendorStaffItem,
  VendorTeamMemberItem,
} from "@/src/api/dashboard.api";

export interface StaffCardActionsProps {
  member: VendorStaffItem | VendorTeamMemberItem;
  onRefreshNeeded?: () => void | Promise<void>;
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
  ).toUpperCase();
  const isActive = rawStatus === "ACTIVE";

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
    const actionText = isActive ? "Deactivate" : "Activate";
    const newStatus = isActive ? "INACTIVE" : "ACTIVE";
    const name =
      (member as VendorStaffItem).name ||
      (member as VendorTeamMemberItem).contactName ||
      (member as VendorTeamMemberItem).userId?.name ||
      "this staff member";

    Alert.alert(
      `${actionText} Staff`,
      `Are you sure you want to ${actionText.toLowerCase()} ${name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: actionText,
          style: isActive ? "destructive" : "default",
          onPress: async () => {
            try {
              setStatusLoading(true);
              await updateVendorStaffStatus(member._id, newStatus);
              Alert.alert(
                "Success",
                `Staff account status updated to ${newStatus === "ACTIVE" ? "Active" : "Inactive"}.`
              );
              if (onRefreshNeeded) {
                await onRefreshNeeded();
              }
            } catch (err: any) {
              const msg =
                err?.response?.data?.message ||
                err?.message ||
                `Failed to ${actionText.toLowerCase()} staff member.`;
              Alert.alert("Update Failed", msg);
            } finally {
              setStatusLoading(false);
            }
          },
        },
      ]
    );
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
          numberOfLines={2}
        >
          {isActive ? "Deactivate Staff" : "Activate Staff"}
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
