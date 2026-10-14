import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface AIFailureModalProps {
  visible: boolean;
  imageUri?: string;
  categoryLabel?: string;
  reason?: string;
  failDetailText?: string;
  isSubjectMismatch?: boolean;
  isRevalidating?: boolean;
  onRetry?: () => void;
  onRetakePhoto: () => void;
  onProceedAnyway: () => void;
}

export const AIFailureModal: React.FC<AIFailureModalProps> = ({
  visible,
  imageUri,
  categoryLabel,
  reason,
  failDetailText,
  isSubjectMismatch = false,
  isRevalidating = false,
  onRetry,
  onRetakePhoto,
  onProceedAnyway,
}) => {
  const modalTitleText = isSubjectMismatch
    ? "Subject Mismatch Detected"
    : "Quality Issue Detected";

  const detailBadgeText =
    failDetailText ||
    (isSubjectMismatch
      ? "CHECK FAILED: SUBJECT MISMATCH"
      : "CHECK FAILED: QUALITY ISSUE");

  const descriptionText =
    reason ||
    (isSubjectMismatch
      ? `The photo does not match the required category "${categoryLabel || "inspection item"}". Please retake the photo showing the expected subject.`
      : "The image appears blurry or has lighting issues. This may lead to rejection during review. Please retake the photo for better results.");

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onProceedAnyway}
    >
      <View style={styles.overlayBackdrop}>
        <View style={styles.modalCard}>
          {/* Centered Yellow Warning Icon Circle */}
          <View style={styles.warningCircle}>
            <Ionicons name="warning-outline" size={34} color="#D97706" />
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>{modalTitleText}</Text>

          {/* Failure Check Badge */}
          <View style={styles.failBadge}>
            <View style={styles.failDot} />
            <Text style={styles.failBadgeText} numberOfLines={1}>
              {detailBadgeText}
            </Text>
          </View>

          {/* Image Preview with Overlay */}
          <View style={styles.imageCardContainer}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.photoImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="image-outline" size={40} color="#9CA3AF" />
              </View>
            )}
            <View style={styles.previewOverlayBadge}>
              <Text style={styles.previewOverlayText}>PREVIEW</Text>
            </View>
          </View>

          {/* Explanation / Subtitle */}
          <Text style={styles.descriptionText}>{descriptionText}</Text>

          {/* Subject mismatch warning note */}
          {isSubjectMismatch && (
            <View style={styles.mismatchWarningBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.mismatchWarningText}>
                Subject does not match the required checklist item. Retaking the photo is strongly recommended.
              </Text>
            </View>
          )}

          {/* Primary Action: Retake Photo */}
          <Pressable
            style={[styles.retakeButton, isRevalidating && styles.disabledButton]}
            onPress={onRetakePhoto}
            disabled={isRevalidating}
            accessibilityRole="button"
            accessibilityLabel="Retake Photo"
          >
            <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
            <Text style={styles.retakeButtonText}>
              {isSubjectMismatch ? "Retake Photo (Recommended)" : "Retake Photo"}
            </Text>
          </Pressable>

          {/* Secondary Action: Retry AI Verification */}
          {onRetry && (
            <Pressable
              style={[styles.retryModalButton, isRevalidating && styles.disabledButton]}
              onPress={onRetry}
              disabled={isRevalidating}
              accessibilityRole="button"
              accessibilityLabel="Retry AI Verification"
            >
              {isRevalidating ? (
                <>
                  <ActivityIndicator size="small" color="#D97706" />
                  <Text style={styles.retryModalButtonText}>Verifying with AI...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={18} color="#D97706" />
                  <Text style={styles.retryModalButtonText}>Retry AI Verification</Text>
                </>
              )}
            </Pressable>
          )}

          {/* Tertiary Action: Proceed Anyway */}
          <Pressable
            style={[styles.proceedButton, isRevalidating && styles.disabledButton]}
            onPress={onProceedAnyway}
            disabled={isRevalidating}
            accessibilityRole="button"
            accessibilityLabel="Proceed Anyway"
          >
            <Text style={styles.proceedButtonText}>Review & Proceed Anyway</Text>
          </Pressable>

          {/* Info Banner Box */}
          <View style={styles.infoCalloutBox}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#64748B"
              style={{ marginTop: 1 }}
            />
            <Text style={styles.infoCalloutText}>
              Server validation strictly requires all photos to pass inspection checks. If you proceed, final submission will be rejected by the server until requirements are met.
            </Text>
          </View>

          {/* Footer Subtext */}
          <Text style={styles.footerText}>FIELDWORK CAM AI CORE</Text>
        </View>
      </View>
    </Modal>
  );
};

export default AIFailureModal;

const styles = StyleSheet.create({
  overlayBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  warningCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 10,
  },
  failBadge: {
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
    maxWidth: "100%",
  },
  failDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#DC2626",
  },
  failBadgeText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  imageCardContainer: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  previewOverlayBadge: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewOverlayText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  descriptionText: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  mismatchWarningBox: {
    width: "100%",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  mismatchWarningText: {
    flex: 1,
    fontSize: 12,
    color: "#991B1B",
    lineHeight: 16,
    fontWeight: "600",
  },
  retakeButton: {
    width: "100%",
    backgroundColor: "#78716C",
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  retakeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  retryModalButton: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderColor: "#F59E0B",
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  retryModalButtonText: {
    color: "#D97706",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  proceedButton: {
    width: "100%",
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  proceedButtonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
  infoCalloutBox: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 14,
  },
  infoCalloutText: {
    flex: 1,
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
  },
  footerText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1.2,
    textAlign: "center",
  },
});
