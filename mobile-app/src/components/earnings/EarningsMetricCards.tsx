import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/src/utils/currency.utils";

interface EarningsMetricCardsProps {
  paidAmount: number;
  pendingAmount: number;
}

export const EarningsMetricCards: React.FC<EarningsMetricCardsProps> = ({
  paidAmount,
  pendingAmount,
}) => {
  return (
    <View style={styles.container}>
      {/* Paid Card */}
      <View style={styles.card}>
        <View style={[styles.iconCircle, styles.paidIconBg]}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#3B82F6" />
        </View>
        <Text style={styles.amount}>{formatCurrency(paidAmount)}</Text>
        <Text style={styles.label}>Paid</Text>
      </View>

      {/* Pending Card */}
      <View style={styles.card}>
        <View style={[styles.iconCircle, styles.pendingIconBg]}>
          <Ionicons name="time-outline" size={20} color="#F59E0B" />
        </View>
        <Text style={styles.amount}>{formatCurrency(pendingAmount)}</Text>
        <Text style={styles.label}>Pending</Text>
      </View>
    </View>
  );
};

export default EarningsMetricCards;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 14,
    marginTop: 16,
    marginBottom: 14,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  paidIconBg: {
    backgroundColor: "#EFF6FF",
  },
  pendingIconBg: {
    backgroundColor: "#FFFBEB",
  },
  amount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F1D1B",
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8C827A",
  },
});
