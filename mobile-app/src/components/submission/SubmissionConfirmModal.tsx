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

export interface SubmissionConfirmModalProps {
  visible: boolean;
  photosCount: number;
  aiVerifiedStatus: "All Passed" | "Pending" | "Failed";
  locationStatus: "GPS Verified" | "Unverified";
  notesStatus: "Added" | "None";
  isLoading?: boolean;
  onCancel: () => void;
  onVerify: () => void;
}

export const SubmissionConfirmModal: React.FC<
  SubmissionConfirmModalProps
> = ({
  visible,
  photosCount,
  aiVerifiedStatus,
  locationStatus,
  notesStatus,
  isLoading = false,
  onCancel,
  onVerify,
}) => {
  const getAiColor = () => {
    switch (aiVerifiedStatus) {
      case "All Passed":
        return "#16A34A";
      case "Failed":
        return "#DC2626";
      case "Pending":
      default:
        return "#D97706";
    }
  };

  const getLocationColor = () => {
    return locationStatus === "GPS Verified" ? "#16A34A" : "#64748B";
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlayBackdrop}>
        <View style={styles.modalSheet}>
          {/* Top Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Peach Circle with Paper Plane Icon */}
          <View style={styles.iconCircle}>
            <Ionicons
              name="paper-plane-outline"
              size={28}
              color="#78716C"
              style={{ transform: [{ rotate: "-15deg" }] }}
            />
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>Are you sure you want to submit?</Text>
          <Text style={styles.description}>
            This will submit {photosCount} photo
            {photosCount === 1 ? "" : "s"} for client review. Once submitted,
            you won&apos;t be able to make changes.
          </Text>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            {/* Row 1: Photos Uploaded */}
            <View style={styles.summaryRow}>
              <View style={styles.labelCol}>
                <Ionicons name="camera-outline" size={18} color="#9CA3AF" />
                <Text style={styles.labelText}>Photos Uploaded</Text>
              </View>
              <Text style={styles.valueText}>
                {photosCount} photo{photosCount === 1 ? "" : "s"}
              </Text>
            </View>

            {/* Row 2: AI Verified */}
            <View style={styles.summaryRow}>
              <View style={styles.labelCol}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#9CA3AF"
                />
                <Text style={styles.labelText}>AI Verified</Text>
              </View>
              <Text
                style={[
                  styles.valueText,
                  { color: getAiColor(), fontWeight: "700" },
                ]}
              >
                {aiVerifiedStatus}
              </Text>
            </View>

            {/* Row 3: Location */}
            <View style={styles.summaryRow}>
              <View style={styles.labelCol}>
                <Ionicons name="location-outline" size={18} color="#9CA3AF" />
                <Text style={styles.labelText}>Location</Text>
              </View>
              <Text
                style={[
                  styles.valueText,
                  { color: getLocationColor(), fontWeight: "700" },
                ]}
              >
                {locationStatus}
              </Text>
            </View>

            {/* Row 4: Notes */}
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <View style={styles.labelCol}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#9CA3AF"
                />
                <Text style={styles.labelText}>Notes</Text>
              </View>
              <Text style={styles.valueText}>{notesStatus}</Text>
            </View>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.cancelButton, isLoading && styles.disabledButton]}
              onPress={onCancel}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Cancel Submission"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.verifyButton, isLoading && styles.disabledButton]}
              onPress={onVerify}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Verify and Submit"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="paper-plane-outline"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.verifyButtonText}>Verify</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SubmissionConfirmModal;

const styles = StyleSheet.create({
  overlayBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 13.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: "#FAF8F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F3EFEA",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE4DF",
  },
  labelCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  labelText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  valueText: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "700",
  },
  verifyButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#78716C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
