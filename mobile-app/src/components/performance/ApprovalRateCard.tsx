import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/src/constants/color";

export interface ApprovalRateCardProps {
  approvedCount: number;
  submittedCount: number;
  rejectedCount: number;
  approvalRate: number | null;
}

export const ApprovalRateCard: React.FC<ApprovalRateCardProps> = ({
  approvedCount,
  submittedCount,
  rejectedCount,
  approvalRate,
}) => {
  const displayPercentage =
    approvalRate !== null ? `${approvalRate}%` : "0%";

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.cardTitle}>Approval Rate</Text>

      <View style={styles.contentRow}>
        {/* BIG PERCENTAGE RING/CIRCLE */}
        <View style={styles.circleContainer}>
          <Text style={styles.percentageText}>{displayPercentage}</Text>
          <Text style={styles.percentageLabel}>Approval</Text>
        </View>

        {/* METRICS BREAKDOWN LIST */}
        <View style={styles.breakdownList}>
          {/* APPROVED */}
          <View style={styles.breakdownRow}>
            <View style={styles.labelGroup}>
              <View style={[styles.dot, styles.approvedDot]} />
              <Text style={styles.labelTitle}>Approved</Text>
            </View>
            <Text style={styles.countText}>{approvedCount}</Text>
          </View>

          {/* SUBMITTED / UNDER REVIEW */}
          <View style={styles.breakdownRow}>
            <View style={styles.labelGroup}>
              <View style={[styles.dot, styles.submittedDot]} />
              <Text style={styles.labelTitle}>Submitted / Under Review</Text>
            </View>
            <Text style={styles.countText}>{submittedCount}</Text>
          </View>

          {/* REJECTED */}
          <View style={styles.breakdownRow}>
            <View style={styles.labelGroup}>
              <View style={[styles.dot, styles.rejectedDot]} />
              <Text style={styles.labelTitle}>Rejected</Text>
            </View>
            <Text style={styles.countText}>{rejectedCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ApprovalRateCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 16,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  circleContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: "#DCFCE7",
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  percentageText: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.black,
  },
  percentageLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },
  breakdownList: {
    flex: 1,
    gap: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  approvedDot: { backgroundColor: "#16A34A" },
  submittedDot: { backgroundColor: "#D97706" },
  rejectedDot: { backgroundColor: "#EF4444" },
  labelTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  countText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.black,
  },
});
