import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";
import { VendorProjectItem, VendorStaffItem } from "@/src/api/dashboard.api";

export interface AssignmentConfirmationModalProps {
  visible: boolean;
  project: VendorProjectItem | null;
  staff: VendorStaffItem | null;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const AssignmentConfirmationModal: React.FC<
  AssignmentConfirmationModalProps
> = ({
  visible,
  project,
  staff,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!project) return null;

  const staffName = staff?.name || "Staff Member";
  const formattedDeadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* TITLE & HEADER */}
          <Text style={styles.titleText}>Assign Project</Text>
          <Text style={styles.questionText}>
            Are you sure you want to assign this project to{" "}
            <Text style={styles.staffNameHighlight}>{staffName}</Text>?
          </Text>

          {/* PROJECT PREVIEW CARD */}
          <View style={styles.projectPreviewBox}>
            <View style={styles.projectHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="construct-outline" size={18} color="#6B5E54" />
              </View>
              <Text style={styles.projectNameText} numberOfLines={1}>
                {project.projectName}
              </Text>
            </View>

            <View style={styles.projectDetailsRow}>
              {formattedDeadline ? (
                <Text style={styles.detailText}>Due: {formattedDeadline}</Text>
              ) : null}
              {project.client ? (
                <Text style={styles.detailText}>
                  {formattedDeadline ? " • " : ""}Client: {project.client}
                </Text>
              ) : project.serviceTypeName ? (
                <Text style={styles.detailText}>
                  {formattedDeadline ? " • " : ""}{project.serviceTypeName}
                </Text>
              ) : null}
            </View>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Cancel assignment"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                styles.confirmButton,
                isSubmitting ? styles.disabledButton : null,
              ]}
              onPress={onConfirm}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Confirm assign project"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>Assign Project</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AssignmentConfirmationModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    textAlign: "center",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  staffNameHighlight: {
    fontWeight: "700",
    color: Colors.black,
  },
  projectPreviewBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
  },
  projectHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3EFEA",
    alignItems: "center",
    justifyContent: "center",
  },
  projectNameText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.black,
    flex: 1,
  },
  projectDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 42,
  },
  detailText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
