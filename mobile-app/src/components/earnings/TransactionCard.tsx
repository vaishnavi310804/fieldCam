import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { InvoiceListItem } from "@/src/api/invoices.api";
import { formatCurrency } from "@/src/utils/currency.utils";

interface TransactionCardProps {
  transaction: InvoiceListItem;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
}) => {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Recent";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recent";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const projectReference =
    transaction.projectId?.projectId || transaction.invoiceId || "INV";
  const projectLabel =
    transaction.projectTitle ||
    transaction.projectId?.projectName ||
    "Field Services";
  const title = `${projectReference} — ${projectLabel}`;

  const dateDisplay = formatDate(
    transaction.paymentDate || transaction.invoiceDate || transaction.createdAt
  );
  const statusDisplay = transaction.status;

  const handlePress = () => {
    if (transaction._id) {
      router.push({
        pathname: "/(app)/invoice-preview",
        params: { id: transaction._id },
      });
    }
  };

  const total = Number(transaction.totalAmount || transaction.amount || 0);

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.leftSection}>
        <View style={styles.iconCircle}>
          <Text style={styles.dollarSign}>$</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle}>
            {dateDisplay} — {statusDisplay}
          </Text>
        </View>
      </View>
      <Text style={styles.amount}>{formatCurrency(total)}</Text>
    </Pressable>
  );
};

export default TransactionCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F8F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dollarSign: {
    color: "#00B894",
    fontSize: 18,
    fontWeight: "700",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F1D1B",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8C827A",
  },
  amount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F1D1B",
    textAlign: "right",
  },
});
