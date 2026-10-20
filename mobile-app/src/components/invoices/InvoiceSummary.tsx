import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/src/utils/currency.utils";

interface InvoiceSummaryProps {
  subtotal: number;
  total: number;
}

export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  subtotal,
  total,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Ionicons name="cash-outline" size={17} color="#6E655F" />
        <Text style={styles.sectionTitle}>Financial Summary</Text>
      </View>

      <View style={styles.summaryRows}>
        {/* Subtotal */}
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>{formatCurrency(subtotal)}</Text>
        </View>

        {/* Tax (Fixed 0% per business rules) */}
        <View style={styles.row}>
          <Text style={styles.label}>Tax (0%)</Text>
          <Text style={styles.value}>$0.00</Text>
        </View>

        <View style={styles.divider} />

        {/* Total Due */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Due</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default InvoiceSummary;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EAE5E1",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  summaryRows: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 13,
    color: "#8C827A",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#EAE5E1",
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F1D1B",
  },
  totalBadge: {
    backgroundColor: "#F6F2EF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1F1D1B",
  },
});
