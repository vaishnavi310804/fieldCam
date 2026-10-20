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
import { ChecklistItemStatusDetail } from "@/src/utils/checklistSubmission.utils";

export interface SubmissionConfirmModalProps {
  visible: boolean;
  photosCount: number;
  aiVerifiedStatus: "All Passed" | "Pending" | "Failed";
  locationStatus: "GPS Verified" | "Unverified";
  notesStatus: "Added" | "None";
  isLoading?: boolean;
  checklistProgressText?: string;
  verifiedChecklistCount?: number;
  totalChecklistCount?: number;
  unresolvedItems?: ChecklistItemStatusDetail[];
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
  checklistProgressText,
  verifiedChecklistCount,
  totalChecklistCount,
  unresolvedItems = [],
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

  const isAllPassed = aiVerifiedStatus === "All Passed";

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

          {/* Title & Description: Explicitly Project / Work Order Submission */}
          <Text style={styles.title}>Submit Work for Review?</Text>
          <Text style={styles.description}>
            This will submit the entire project and all checklist photos for client review. Once submitted, you won&apos;t be able to make changes.
          </Text>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            {/* Row 1: Checklist Progress */}
            <View style={styles.summaryRow}>
              <View style={styles.labelCol}>
                <Ionicons name="checkbox-outline" size={18} color="#9CA3AF" />
                <Text style={styles.labelText}>Checklist Verified</Text>
              </View>
              <Text style={styles.valueText}>
                {verifiedChecklistCount !== undefined && totalChecklistCount !== undefined
                  ? `${verifiedChecklistCount} of ${totalChecklistCount} items`
                  : checklistProgressText || `${photosCount} items`}
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
                <Text style={styles.labelText}>AI Status</Text>
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

            {/* Row 3: Total Photos */}
            <View style={styles.summaryRow}>
              <View style={styles.labelCol}>
                <Ionicons name="camera-outline" size={18} color="#9CA3AF" />
                <Text style={styles.labelText}>Photos Uploaded</Text>
              </View>
              <Text style={styles.valueText}>
                {photosCount} photo{photosCount === 1 ? "" : "s"}
              </Text>
            </View>

            {/* Row 4: Location */}
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

            {/* Row 5: Notes */}
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

          {/* Validation Warning Box when checks are not all passed */}
          {!isAllPassed && (
            <View
              style={
                aiVerifiedStatus === "Failed"
                  ? styles.validationWarningBoxFailed
                  : styles.validationWarningBoxPending
              }
            >
              <Ionicons
                name={aiVerifiedStatus === "Failed" ? "close-circle" : "warning-outline"}
                size={18}
                color={aiVerifiedStatus === "Failed" ? "#DC2626" : "#D97706"}
                style={{ marginTop: 1 }}
              />
              <View style={{ flex: 1, gap: 6 }}>
                <Text
                  style={[
                    styles.validationWarningText,
                    { color: aiVerifiedStatus === "Failed" ? "#991B1B" : "#92400E" },
                  ]}
                >
                  {aiVerifiedStatus === "Failed"
                    ? "One or more checklist items failed AI verification. Backend rules require all required checklist items to pass before client submission."
                    : "AI verification has not completed for all required checklist items. The server requires passing verification for all items before accepting project submissions."}
                </Text>

                {/* Actionable Unresolved Checklist Categories List */}
                {unresolvedItems.length > 0 && (
                  <View style={styles.unresolvedContainer}>
                    <Text
                      style={[
                        styles.unresolvedTitle,
                        { color: aiVerifiedStatus === "Failed" ? "#991B1B" : "#9A3412" },
                      ]}
                    >
                      Checklist items requiring action ({unresolvedItems.length}):
                    </Text>
                    {unresolvedItems.map((item) => (
                      <View key={item.checklistItemId} style={styles.unresolvedItemRow}>
                        <View style={styles.unresolvedCategoryCol}>
                          <Ionicons
                            name={
                              item.status === "FAILED"
                                ? "close-circle"
                                : item.status === "MISSING"
                                ? "alert-circle-outline"
                                : "time-outline"
                            }
                            size={13}
                            color={item.status === "FAILED" ? "#DC2626" : "#D97706"}
                          />
                          <Text style={styles.unresolvedCategoryText} numberOfLines={1}>
                            {item.category}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.unresolvedStatusBadge,
                            item.status === "FAILED"
                              ? styles.badgeFailed
                              : item.status === "MISSING"
                              ? styles.badgeMissing
                              : styles.badgePending,
                          ]}
                        >
                          {item.status === "MISSING"
                            ? "Missing Photo"
                            : item.status === "FAILED"
                            ? "Failed AI"
                            : "Pending AI"}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

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
              style={[
                styles.verifyButton,
                !isAllPassed && styles.verifyButtonWarning,
                isLoading && styles.disabledButton,
              ]}
              onPress={onVerify}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={isAllPassed ? "Submit Work" : "Submit Anyway"}
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
                  <Text style={styles.verifyButtonText}>
                    {isAllPassed ? "Submit Work" : "Submit Anyway"}
                  </Text>
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
  validationWarningBox: {
    width: "100%",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 16,
  },
  validationWarningBoxFailed: {
    width: "100%",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 16,
  },
  validationWarningBoxPending: {
    width: "100%",
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 16,
  },
  validationWarningText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "600",
  },
  unresolvedContainer: {
    width: "100%",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.08)",
    gap: 6,
  },
  unresolvedTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  unresolvedItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 2,
  },
  unresolvedCategoryCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  unresolvedCategoryText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
    flex: 1,
  },
  unresolvedStatusBadge: {
    fontSize: 10.5,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  badgeFailed: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  badgePending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  badgeMissing: {
    backgroundColor: "#F3F4F6",
    color: "#4B5563",
  },
  verifyButtonWarning: {
    backgroundColor: "#B91C1C",
  },
});
