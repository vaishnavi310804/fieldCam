import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { InvoiceListItem } from "@/src/api/invoices.api";
import { TransactionCard } from "./TransactionCard";

interface RecentTransactionsProps {
  transactions: InvoiceListItem[];
  maxDisplay?: number;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  maxDisplay = 5,
}) => {
  const displayItems = transactions.slice(0, maxDisplay);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
      </View>

      {displayItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recent transactions found.</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {displayItems.map((item) => (
            <TransactionCard
              key={item._id || item.invoiceId}
              transaction={item}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default RecentTransactions;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  listContainer: {
    width: "100%",
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8C827A",
  },
});
