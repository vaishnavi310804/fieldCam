import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChecklistItemStatusDetail } from "@/src/utils/checklistSubmission.utils";

export interface UnresolvedChecklistSectionProps {
  unresolvedItems: ChecklistItemStatusDetail[];
  isRetryingPhotoId?: string | null;
  onRetry: (item: ChecklistItemStatusDetail) => void;
  onRetake: (item: ChecklistItemStatusDetail) => void;
}

export const UnresolvedChecklistSection: React.FC<
  UnresolvedChecklistSectionProps
> = ({
  unresolvedItems,
  isRetryingPhotoId,
  onRetry,
  onRetake,
}) => {
  if (!unresolvedItems || unresolvedItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="list-circle-outline" size={20} color="#0F172A" />
          <Text style={styles.sectionTitle}>
            Unresolved Checklist Items ({unresolvedItems.length})
          </Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          The following items require action before submitting the work order for review:
        </Text>
      </View>

      <View style={styles.itemsList}>
        {unresolvedItems.map((item, index) => {
          const isFailed = item.status === "FAILED";
          const isMissing = item.status === "MISSING";
          const hasPhotoId = Boolean(item.photoId);
          const isRetryingThis =
            hasPhotoId && isRetryingPhotoId === item.photoId;
          const isAnyRetrying = Boolean(isRetryingPhotoId);

          const badgeConfig = isFailed
            ? {
                bg: "#FEE2E2",
                border: "#FECACA",
                color: "#DC2626",
                text: "Failed AI",
                icon: "close-circle" as const,
              }
            : isMissing
            ? {
                bg: "#F1F5F9",
                border: "#CBD5E1",
                color: "#475569",
                text: "Missing Photo",
                icon: "camera-outline" as const,
              }
            : {
                bg: "#FEF3C7",
                border: "#FDE68A",
                color: "#D97706",
                text: "Pending AI",
                icon: "time-outline" as const,
              };

          return (
            <View
              key={item.photoId || item.checklistItemId || index}
              style={[
                styles.itemCard,
                isFailed
                  ? styles.itemCardFailed
                  : isMissing
                  ? styles.itemCardMissing
                  : styles.itemCardPending,
              ]}
            >
              {/* Category Header Row */}
              <View style={styles.cardHeaderRow}>
                <Text style={styles.categoryTitle} numberOfLines={1}>
                  {item.category}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: badgeConfig.bg,
                      borderColor: badgeConfig.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={badgeConfig.icon}
                    size={12}
                    color={badgeConfig.color}
                  />
                  <Text
                    style={[styles.statusBadgeText, { color: badgeConfig.color }]}
                  >
                    {badgeConfig.text}
                  </Text>
                </View>
              </View>

              {/* Specific Reason / Instruction */}
              <View style={styles.reasonRow}>
                <Ionicons
                  name={
                    isFailed
                      ? "alert-circle"
                      : isMissing
                      ? "information-circle"
                      : "hourglass-outline"
                  }
                  size={14}
                  color={badgeConfig.color}
                  style={{ marginTop: 2 }}
                />
                <Text style={styles.reasonText}>
                  {item.reason ||
                    (isFailed
                      ? "AI could not confirm required checklist item in photo"
                      : isMissing
                      ? "Photo evidence has not been captured yet"
                      : "AI verification is processing")}
                </Text>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actionsRow}>
                {isMissing ? (
                  /* Missing Photo: Primary Take Photo Action */
                  <Pressable
                    style={styles.takePhotoBtn}
                    onPress={() => onRetake(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Take photo for ${item.category}`}
                  >
                    <Ionicons name="camera" size={15} color="#FFFFFF" />
                    <Text style={styles.takePhotoBtnText}>Take Photo</Text>
                  </Pressable>
                ) : (
                  /* Has Photo (Failed or Pending): Retake & Retry Options */
                  <>
                    <Pressable
                      style={styles.retakeBtn}
                      onPress={() => onRetake(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Retake photo for ${item.category}`}
                    >
                      <Ionicons name="camera-outline" size={15} color="#FFFFFF" />
                      <Text style={styles.retakeBtnText}>Retake Photo</Text>
                    </Pressable>

                    {hasPhotoId && (
                      <Pressable
                        style={[
                          styles.retryBtn,
                          (isRetryingThis || isAnyRetrying) && styles.disabledBtn,
                        ]}
                        onPress={() => onRetry(item)}
                        disabled={isRetryingThis || isAnyRetrying}
                        accessibilityRole="button"
                        accessibilityLabel={`Retry AI verification for ${item.category}`}
                      >
                        {isRetryingThis ? (
                          <>
                            <ActivityIndicator size="small" color="#D97706" />
                            <Text style={styles.retryBtnText}>Verifying...</Text>
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
                    )}
                  </>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default UnresolvedChecklistSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: "#64748B",
    lineHeight: 17,
  },
  itemsList: {
    gap: 10,
  },
  itemCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  itemCardFailed: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  itemCardPending: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  itemCardMissing: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 10,
  },
  reasonText: {
    flex: 1,
    fontSize: 12.5,
    color: "#374151",
    lineHeight: 17,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  takePhotoBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#475569",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  takePhotoBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  retakeBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#475569",
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
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderColor: "#F59E0B",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  retryBtnText: {
    color: "#D97706",
    fontSize: 13,
    fontWeight: "700",
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
