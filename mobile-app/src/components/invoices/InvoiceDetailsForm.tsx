import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InvoiceDetailsFormProps {
  invoiceNumber: string;
  onInvoiceNumberChange: (text: string) => void;
  clientName: string;
  invoiceDate: string;
  onInvoiceDateChange: (text: string) => void;
  dueDate: string;
  onDueDateChange: (text: string) => void;
  notes: string;
  onNotesChange: (text: string) => void;
  editable?: boolean;
}

export const InvoiceDetailsForm: React.FC<InvoiceDetailsFormProps> = ({
  invoiceNumber,
  onInvoiceNumberChange,
  clientName,
  invoiceDate,
  onInvoiceDateChange,
  dueDate,
  onDueDateChange,
  notes,
  onNotesChange,
  editable = true,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Ionicons name="document-text-outline" size={17} color="#6E655F" />
        <Text style={styles.sectionTitle}>Invoice Details</Text>
      </View>

      <View style={styles.formContent}>
        {/* Invoice Number */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Invoice Number</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={invoiceNumber}
              onChangeText={onInvoiceNumberChange}
              editable={editable}
              placeholder="e.g. INV-2026-0034"
              placeholderTextColor="#A8A29E"
              style={styles.inputText}
            />
          </View>
        </View>

        {/* Bill To (Client) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Bill To (Client)</Text>
          <View style={[styles.inputBox, styles.inputDisabled]}>
            <Text style={styles.inputText} numberOfLines={1}>
              {clientName || "Client"}
            </Text>
          </View>
        </View>

        {/* Invoice Date & Due Date Row */}
        <View style={styles.dateRow}>
          {/* Invoice Date */}
          <View style={styles.dateCol}>
            <Text style={styles.fieldLabel}>Invoice Date</Text>
            <View style={styles.dateInputBox}>
              <Ionicons
                name="calendar-outline"
                size={15}
                color="#8C827A"
                style={styles.dateIcon}
              />
              <TextInput
                value={invoiceDate}
                onChangeText={onInvoiceDateChange}
                editable={editable}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#A8A29E"
                style={styles.dateInputText}
              />
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.dateCol}>
            <Text style={styles.fieldLabel}>Due Date</Text>
            <View style={styles.dateInputBox}>
              <Ionicons
                name="calendar-outline"
                size={15}
                color="#8C827A"
                style={styles.dateIcon}
              />
              <TextInput
                value={dueDate}
                onChangeText={onDueDateChange}
                editable={editable}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#A8A29E"
                style={styles.dateInputText}
              />
            </View>
          </View>
        </View>

        {/* Notes / Payment Instructions */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Notes / Payment Instructions (Optional)</Text>
          <View style={[styles.inputBox, styles.notesInputBox]}>
            <TextInput
              value={notes}
              onChangeText={onNotesChange}
              editable={editable}
              placeholder="Bank details, deliverables note..."
              placeholderTextColor="#A8A29E"
              multiline
              numberOfLines={2}
              style={[styles.inputText, styles.notesText]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default InvoiceDetailsForm;

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
  formContent: {
    gap: 12,
  },
  fieldGroup: {},
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8C827A",
    marginBottom: 5,
  },
  inputBox: {
    backgroundColor: "#F6F2EF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ECE6E1",
  },
  inputDisabled: {
    backgroundColor: "#F2ECE7",
  },
  inputText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F1D1B",
    padding: 0,
  },
  dateRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateCol: {
    flex: 1,
  },
  dateInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F2EF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#ECE6E1",
  },
  dateIcon: {
    marginRight: 6,
  },
  dateInputText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#1F1D1B",
    padding: 0,
  },
  notesInputBox: {
    minHeight: 56,
    paddingVertical: 10,
  },
  notesText: {
    fontSize: 13,
    fontWeight: "500",
    textAlignVertical: "top",
  },
});
