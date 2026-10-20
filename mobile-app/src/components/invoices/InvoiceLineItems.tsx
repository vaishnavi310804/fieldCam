import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InvoiceLineItem } from "@/src/api/invoices.api";
import { formatCurrency } from "@/src/utils/currency.utils";

interface InvoiceLineItemsProps {
  items: InvoiceLineItem[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (
    index: number,
    field: "description" | "quantity" | "rate",
    value: string
  ) => void;
  editable?: boolean;
}

export const InvoiceLineItems: React.FC<InvoiceLineItemsProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Ionicons name="reader-outline" size={17} color="#6E655F" />
        <Text style={styles.sectionTitle}>Line Items</Text>
      </View>

      <View style={styles.itemsList}>
        {items.map((item, index) => {
          const itemAmount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);

          return (
            <View key={item._id || index} style={styles.itemCard}>
              <View style={styles.topRow}>
                <View style={styles.descInputBox}>
                  <TextInput
                    value={item.description}
                    onChangeText={(val) =>
                      onUpdateItem(index, "description", val)
                    }
                    editable={editable}
                    placeholder="Item description (e.g. Site Survey)"
                    placeholderTextColor="#A8A29E"
                    style={styles.descInput}
                  />
                </View>

                <View style={styles.amountAndDeleteRow}>
                  <Text style={styles.amountText}>
                    {formatCurrency(itemAmount)}
                  </Text>
                  {editable && items.length > 1 && (
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => onRemoveItem(index)}
                      accessibilityRole="button"
                      accessibilityLabel="Delete item"
                    >
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Qty & Rate Inputs */}
              <View style={styles.bottomRow}>
                <View style={styles.qtyRateGroup}>
                  <Text style={styles.metaLabel}>Qty:</Text>
                  <TextInput
                    value={String(item.quantity !== undefined ? item.quantity : 1)}
                    onChangeText={(val) => {
                      const digitsOnly = val.replace(/[^\d]/g, "");
                      onUpdateItem(index, "quantity", digitsOnly);
                    }}
                    editable={editable}
                    keyboardType="number-pad"
                    placeholder="1"
                    placeholderTextColor="#A8A29E"
                    style={styles.numInput}
                  />
                </View>

                <Text style={styles.dotSeparator}>•</Text>

                <View style={styles.qtyRateGroup}>
                  <Text style={styles.metaLabel}>Rate ($):</Text>
                  <TextInput
                    value={
                      item.rawRate !== undefined
                        ? item.rawRate
                        : item.rate !== undefined && item.rate !== 0
                        ? String(item.rate)
                        : ""
                    }
                    onChangeText={(val) => {
                      const normalized = val.replace(",", ".");
                      if (/[^\d.]/.test(normalized)) {
                        return;
                      }
                      const parts = normalized.split(".");
                      if (parts.length > 2) {
                        return;
                      }
                      if (parts.length === 2 && parts[1].length > 2) {
                        return;
                      }
                      onUpdateItem(index, "rate", normalized);
                    }}
                    editable={editable}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#A8A29E"
                    style={styles.numInput}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {editable && (
        <Pressable style={styles.addButton} onPress={onAddItem}>
          <Ionicons name="add" size={18} color="#6E655F" />
          <Text style={styles.addButtonText}>Add Line Item</Text>
        </Pressable>
      )}
    </View>
  );
};

export default InvoiceLineItems;

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  itemsList: {
    gap: 10,
    marginBottom: 10,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EAE5E1",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  descInputBox: {
    flex: 1,
    marginRight: 8,
  },
  descInput: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F1D1B",
    padding: 0,
  },
  amountAndDeleteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amountText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F1D1B",
  },
  deleteButton: {
    padding: 4,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyRateGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: "#8C827A",
    fontWeight: "500",
  },
  numInput: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F1D1B",
    backgroundColor: "#F6F2EF",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 44,
  },
  dotSeparator: {
    color: "#8C827A",
    marginHorizontal: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#E6DED8",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A423D",
  },
});
