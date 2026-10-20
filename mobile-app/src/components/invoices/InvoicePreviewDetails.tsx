import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InvoiceListItem } from "@/src/api/invoices.api";
import { formatCurrency } from "@/src/utils/currency.utils";

interface InvoicePreviewDetailsProps {
  invoice: InvoiceListItem;
}

export const InvoicePreviewDetails: React.FC<InvoicePreviewDetailsProps> = ({
  invoice,
}) => {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const companyName =
    invoice.vendorId?.companyName ||
    invoice.vendorName ||
    "Authorized Vendor";
  const vendorName =
    invoice.vendorId?.companyName ||
    invoice.vendorName ||
    invoice.vendorId?.contactName ||
    "Vendor";
  const vendorContact = invoice.vendorId?.contactName || "";
  const vendorLocation = invoice.vendorId?.location || "";

  const clientName =
    invoice.projectId?.client || "Client";
  const projectLocation =
    invoice.projectId?.location || "";

  const projectReference =
    invoice.projectId?.projectId || invoice.invoiceId;
  const projectTitle =
    invoice.projectTitle || invoice.projectId?.projectName || "Field Services";

  const items = Array.isArray(invoice.items) && invoice.items.length > 0
    ? invoice.items
    : [
        {
          description: projectTitle,
          quantity: 1,
          rate: Number(invoice.amount || 0),
          amount: Number(invoice.amount || 0),
        },
      ];

  const subtotal = Number(invoice.subtotal || invoice.amount || 0);
  const total = Number(invoice.totalAmount || invoice.amount || 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return { bg: "#DEF7EC", text: "#03543F" };
      case "Approved":
        return { bg: "#E1EFFE", text: "#1E429F" };
      case "Submitted":
      case "Pending":
        return { bg: "#FEF08A", text: "#854D0E" };
      case "Draft":
        return { bg: "#E5E7EB", text: "#374151" };
      case "Rejected":
        return { bg: "#FDE8E8", text: "#9B1C1C" };
      default:
        return { bg: "#F3F4F6", text: "#4B5563" };
    }
  };

  const statusStyle = getStatusColor(invoice.status);

  return (
    <View style={styles.container}>
      {/* Rejection Alert if Rejected */}
      {invoice.status === "Rejected" && invoice.rejectionReason && (
        <View style={styles.rejectionCard}>
          <View style={styles.rejectionHeader}>
            <Ionicons name="alert-circle" size={18} color="#C62828" />
            <Text style={styles.rejectionTitle}>Admin Rejection Reason</Text>
          </View>
          <Text style={styles.rejectionText}>{invoice.rejectionReason}</Text>
        </View>
      )}

      {/* Main Invoice Document Card */}
      <View style={styles.documentCard}>
        {/* Top Row: INVOICE / ID & Vendor Info */}
        <View style={styles.docHeaderRow}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceIdText}>{invoice.invoiceId}</Text>
          </View>
          <View style={styles.vendorInfoCol}>
            <Text style={styles.vendorNameText}>{vendorName}</Text>
            {vendorContact ? (
              <Text style={styles.vendorContactText}>{vendorContact}</Text>
            ) : null}
            {vendorLocation ? (
              <Text style={styles.vendorContactText}>{vendorLocation}</Text>
            ) : null}
          </View>
        </View>

        {/* Bill To & Dates Row */}
        <View style={styles.billToAndDatesRow}>
          <View style={styles.billToCol}>
            <Text style={styles.sectionMetaHeader}>BILL TO</Text>
            <Text style={styles.clientNameText}>{clientName}</Text>
            {projectLocation ? (
              <Text style={styles.clientAddressText}>{projectLocation}</Text>
            ) : null}
          </View>

          <View style={styles.datesCol}>
            <View style={styles.dateBlock}>
              <Text style={styles.sectionMetaHeader}>INVOICE DATE</Text>
              <Text style={styles.dateValueText}>
                {formatDate(invoice.invoiceDate || invoice.createdAt)}
              </Text>
            </View>
            <View style={styles.dateBlock}>
              <Text style={styles.sectionMetaHeader}>DUE DATE</Text>
              <Text style={styles.dateValueText}>
                {formatDate(invoice.dueDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Project Reference Badge */}
        <View style={styles.projectRefBox}>
          <View style={styles.projectRefIconCircle}>
            <Ionicons name="business-outline" size={16} color="#8C827A" />
          </View>
          <View style={styles.projectRefTextCol}>
            <Text style={styles.projectRefLabel}>Project Reference</Text>
            <Text style={styles.projectRefValue} numberOfLines={1}>
              {projectReference} — {projectTitle}
            </Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colHeader, styles.descCol]}>DESCRIPTION</Text>
            <Text style={[styles.colHeader, styles.qtyCol]}>QTY</Text>
            <Text style={[styles.colHeader, styles.rateCol]}>RATE</Text>
            <Text style={[styles.colHeader, styles.amountCol]}>AMOUNT</Text>
          </View>

          {items.map((it, idx) => (
            <View key={it._id || idx} style={styles.tableDataRow}>
              <Text style={[styles.cellText, styles.descCol]} numberOfLines={2}>
                {it.description}
              </Text>
              <Text style={[styles.cellText, styles.qtyCol]}>
                {it.quantity}
              </Text>
              <Text style={[styles.cellText, styles.rateCol]}>
                ${Number(it.rate || 0).toFixed(2)}
              </Text>
              <Text style={[styles.cellBoldText, styles.amountCol]}>
                ${Number(it.amount || 0).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Financial Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (0%)</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Notes / Payment Instructions */}
        {invoice.notes && invoice.notes.trim() ? (
          <>
            <View style={styles.divider} />
            <View style={styles.notesContainer}>
              <Text style={styles.notesHeader}>NOTES / PAYMENT INSTRUCTIONS</Text>
              <Text style={styles.notesContent}>{invoice.notes.trim()}</Text>
            </View>
          </>
        ) : null}

        <View style={styles.divider} />

        {/* Company Authorization Block */}
        <View style={styles.authorizationBlock}>
          <Text style={styles.authHeader}>DIGITALLY SIGNED BY</Text>
          <View style={styles.authContentBox}>
            <Text style={styles.authCompanyName}>{companyName}</Text>
            <Text style={styles.authRepresentativeText}>
              Authorized company representative
            </Text>
            <Text style={styles.authSecondaryText}>
              Digitally authorized through the authenticated FieldCam account.
            </Text>
          </View>
        </View>
      </View>

      {/* Meta Cards below document */}
      <View style={styles.metaCardsContainer}>
        {/* Status Card */}
        <View style={styles.metaCard}>
          <View style={styles.metaCardLeft}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#00B894" />
            <Text style={styles.metaCardTitle}>Invoice Status</Text>
          </View>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: statusStyle.bg },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                { color: statusStyle.text },
              ]}
            >
              {invoice.status}
            </Text>
          </View>
        </View>

        {/* Payment Terms / Due Date Card */}
        <View style={styles.metaCard}>
          <View style={styles.metaCardLeft}>
            <Ionicons name="time-outline" size={18} color="#D97706" />
            <Text style={styles.metaCardTitle}>Payment Terms</Text>
          </View>
          <Text style={styles.metaCardRightText}>
            {invoice.dueDate ? `Due ${formatDate(invoice.dueDate)}` : "Due on receipt"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default InvoicePreviewDetails;

const styles = StyleSheet.create({
  container: {
    gap: 14,
    marginBottom: 16,
  },
  rejectionCard: {
    backgroundColor: "#FFEBEE",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  rejectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  rejectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#C62828",
  },
  rejectionText: {
    fontSize: 12,
    color: "#3E3734",
    lineHeight: 17,
  },
  documentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#ECE6E1",
  },
  docHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  invoiceTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1F1D1B",
    letterSpacing: -0.5,
  },
  invoiceIdText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8C827A",
    marginTop: 2,
  },
  vendorInfoCol: {
    alignItems: "flex-end",
  },
  vendorNameText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F1D1B",
  },
  vendorContactText: {
    fontSize: 11,
    color: "#8C827A",
    marginTop: 1,
  },
  billToAndDatesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  billToCol: {
    flex: 1,
    marginRight: 12,
  },
  sectionMetaHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8C827A",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  clientNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  clientAddressText: {
    fontSize: 11,
    color: "#8C827A",
    marginTop: 2,
  },
  datesCol: {
    alignItems: "flex-end",
    gap: 8,
  },
  dateBlock: {
    alignItems: "flex-end",
  },
  dateValueText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  projectRefBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF7F5",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  projectRefIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F4ECE6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  projectRefTextCol: {
    flex: 1,
  },
  projectRefLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#8C827A",
  },
  projectRefValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  tableContainer: {
    marginBottom: 14,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F2EBE5",
    paddingBottom: 6,
    marginBottom: 8,
  },
  colHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8C827A",
  },
  descCol: {
    flex: 5,
  },
  qtyCol: {
    flex: 1.5,
    textAlign: "center",
  },
  rateCol: {
    flex: 2.5,
    textAlign: "right",
  },
  amountCol: {
    flex: 3,
    textAlign: "right",
  },
  tableDataRow: {
    flexDirection: "row",
    paddingVertical: 6,
  },
  cellText: {
    fontSize: 12,
    color: "#3E3734",
  },
  cellBoldText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#EAE5E1",
    marginVertical: 12,
  },
  summaryContainer: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#8C827A",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  totalRow: {
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F1D1B",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1F1D1B",
  },
  notesContainer: {
    backgroundColor: "#FAF7F5",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EAE5E1",
    marginTop: 4,
    marginBottom: 4,
  },
  notesHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8C827A",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  notesContent: {
    fontSize: 12,
    color: "#3E3734",
    lineHeight: 18,
  },
  authorizationBlock: {
    marginTop: 4,
  },
  authHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8C827A",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  authContentBox: {
    backgroundColor: "#FAF7F5",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EAE5E1",
    gap: 3,
  },
  authCompanyName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  authRepresentativeText: {
    fontSize: 11,
    color: "#6E655F",
    fontWeight: "500",
  },
  authSecondaryText: {
    fontSize: 10,
    color: "#8C827A",
    fontStyle: "italic",
    marginTop: 2,
    lineHeight: 14,
  },
  metaCardsContainer: {
    gap: 10,
  },
  metaCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EAE5E1",
  },
  metaCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaCardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F1D1B",
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  metaCardRightText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8C827A",
  },
});
