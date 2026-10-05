import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface WorkSubmittedModalProps {
  visible: boolean;
  workOrderId: string;
  photosCount: number;
  submittedAt?: string;
  estReviewText?: string;
  onViewStatus: () => void;
  onBackToDashboard: () => void;
}

export const WorkSubmittedModal: React.FC<WorkSubmittedModalProps> = ({
  visible,
  workOrderId,
  photosCount,
  submittedAt,
  estReviewText,
  onViewStatus,
  onBackToDashboard,
}) => {
  const formatSubmittedTimestamp = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(d.getTime())) return dateStr || "";

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const month = monthNames[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${month} ${day}, ${year} — ${hours}:${minutes} ${ampm}`;
  };

  const formattedDate = formatSubmittedTimestamp(submittedAt);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onBackToDashboard}
    >
      <View style={styles.overlayBackdrop}>
        <View style={styles.modalSheet}>
          {/* Top Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Peach Circle with Checkmark Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={36} color="#78716C" />
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>Work Submitted!</Text>
          <Text style={styles.description}>
            Your photos and report have been submitted for review. You&apos;ll
            receive a notification when the client responds.
          </Text>

          {/* Details Card */}
          <View style={styles.detailsCard}>
            {/* Row 1: Work Order */}
            <View style={styles.detailsRow}>
              <Text style={styles.labelText}>Work Order</Text>
              <Text style={styles.valueText}>{workOrderId}</Text>
            </View>

            {/* Row 2: Photos */}
            <View style={styles.detailsRow}>
              <Text style={styles.labelText}>Photos</Text>
              <Text style={styles.valueText}>{photosCount} submitted</Text>
            </View>

            {/* Row 3: Submitted */}
            <View
              style={[
                styles.detailsRow,
                !estReviewText && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={styles.labelText}>Submitted</Text>
              <Text style={styles.valueText}>{formattedDate}</Text>
            </View>

            {/* Row 4: Est. Review (Only rendered if available from backend) */}
            {estReviewText ? (
              <View style={[styles.detailsRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.labelText}>Est. Review</Text>
                <Text style={styles.valueText}>{estReviewText}</Text>
              </View>
            ) : null}
          </View>

          {/* Action Buttons Stack */}
          <View style={styles.buttonStack}>
            <Pressable
              style={styles.viewStatusButton}
              onPress={onViewStatus}
              accessibilityRole="button"
              accessibilityLabel="View Submission Status"
            >
              <Text style={styles.viewStatusButtonText}>
                View Submission Status
              </Text>
            </Pressable>

            <Pressable
              style={styles.dashboardButton}
              onPress={onBackToDashboard}
              accessibilityRole="button"
              accessibilityLabel="Back to Dashboard"
            >
              <Text style={styles.dashboardButtonText}>Back to Dashboard</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default WorkSubmittedModal;

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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
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
  detailsCard: {
    width: "100%",
    backgroundColor: "#FAF8F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F3EFEA",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE4DF",
  },
  labelText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  valueText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "700",
  },
  buttonStack: {
    width: "100%",
    gap: 10,
  },
  viewStatusButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  viewStatusButtonText: {
    color: "#78716C",
    fontSize: 15,
    fontWeight: "700",
  },
  dashboardButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#78716C",
    alignItems: "center",
    justifyContent: "center",
  },
  dashboardButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
