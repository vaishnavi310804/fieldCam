import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface SubmissionErrorItem {
  checklistItemId?: string;
  category?: string;
  photoId?: string;
  reason?: string;
}

export interface SubmissionErrorsModalProps {
  visible: boolean;
  errors: SubmissionErrorItem[];
  isRetryingPhotoId?: string | null;
  onClose: () => void;
  onRetake: (errorItem: SubmissionErrorItem) => void;
  onRetry: (errorItem: SubmissionErrorItem) => void;
}

export const SubmissionErrorsModal: React.FC<SubmissionErrorsModalProps> = ({
  visible,
  errors,
  isRetryingPhotoId,
  onClose,
  onRetake,
  onRetry,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlayBackdrop}>
        <View style={styles.modalSheet}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Red Alert Header Icon */}
          <View style={styles.headerIconCircle}>
            <Ionicons name="alert-circle" size={32} color="#DC2626" />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Submission Rejected by Server</Text>
          <Text style={styles.subtitle}>
            The server requires all checklist photos to pass AI and GPS verification before
            submitting. Please resolve the following requirement{errors.length === 1 ? "" : "s"}:
          </Text>

          {/* List of failed items */}
          <ScrollView
            style={styles.errorList}
            contentContainerStyle={styles.errorListContent}
            showsVerticalScrollIndicator={false}
          >
            {errors.map((item, index) => {
              const isRetryingThis =
                Boolean(item.photoId) && isRetryingPhotoId === item.photoId;
              const hasPhotoId = Boolean(item.photoId);

              return (
                <View
                  key={item.photoId || item.checklistItemId || index}
                  style={styles.errorCard}
                >
                  {/* Category Header */}
                  <View style={styles.errorCardHeader}>
                    <View style={styles.categoryBadge}>
                      <Ionicons name="bookmark-outline" size={13} color="#991B1B" />
                      <Text style={styles.categoryBadgeText} numberOfLines={1}>
                        {item.category || "Checklist Item"}
                      </Text>
                    </View>
                  </View>

                  {/* Failure Reason */}
                  <Text style={styles.reasonText}>
                    {item.reason || "Validation check failed for this category"}
                  </Text>

                  {/* Action Buttons for this item */}
                  <View style={styles.cardActionsRow}>
                    {/* Retake Photo Button */}
                    <Pressable
                      style={styles.retakeBtn}
                      onPress={() => onRetake(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Retake photo for ${item.category || "item"}`}
                    >
                      <Ionicons name="camera-outline" size={15} color="#FFFFFF" />
                      <Text style={styles.retakeBtnText}>Retake Photo</Text>
                    </Pressable>

                    {/* Retry AI Verification Button */}
                    {hasPhotoId ? (
                      <Pressable
                        style={[
                          styles.retryBtn,
                          isRetryingThis && styles.disabledBtn,
                        ]}
                        onPress={() => onRetry(item)}
                        disabled={isRetryingThis || Boolean(isRetryingPhotoId)}
                        accessibilityRole="button"
                        accessibilityLabel={`Retry verification for ${item.category || "item"}`}
                      >
                        {isRetryingThis ? (
                          <>
                            <ActivityIndicator size="small" color="#D97706" />
                            <Text style={styles.retryBtnText}>Retrying...</Text>
                          </>
                        ) : (
                          <>
                            <Ionicons
                              name="refresh-outline"
                              size={15}
                              color="#D97706"
                            />
                            <Text style={styles.retryBtnText}>Retry AI</Text>
                          </>
                        )}
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Dismiss / Review Button */}
          <Pressable
            style={styles.dismissButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close and review photos"
          >
            <Text style={styles.dismissButtonText}>Close & Review Photos</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default SubmissionErrorsModal;

const styles = StyleSheet.create({
  overlayBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    marginBottom: 14,
  },
  headerIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  errorList: {
    width: "100%",
  },
  errorListContent: {
    gap: 12,
    paddingBottom: 12,
  },
  errorCard: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  errorCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#991B1B",
  },
  reasonText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
    marginBottom: 12,
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  retakeBtn: {
    flex: 1,
    height: 38,
    backgroundColor: "#78716C",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  retakeBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  retryBtn: {
    flex: 1,
    height: 38,
    backgroundColor: "#FFFFFF",
    borderColor: "#F59E0B",
    borderWidth: 1.5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  retryBtnText: {
    color: "#D97706",
    fontSize: 13,
    fontWeight: "700",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  dismissButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  dismissButtonText: {
    color: "#475569",
    fontSize: 15,
    fontWeight: "700",
  },
});
