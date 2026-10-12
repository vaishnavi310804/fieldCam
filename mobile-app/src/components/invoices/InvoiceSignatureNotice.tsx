import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InvoiceSignatureNoticeProps {
  signerName?: string;
}

export const InvoiceSignatureNotice: React.FC<InvoiceSignatureNoticeProps> = ({
  signerName = "Vendor Partner",
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleWithIcon}>
          <Ionicons name="pencil-outline" size={17} color="#6E655F" />
          <Text style={styles.sectionTitle}>Digital Signature</Text>
        </View>
        <View style={styles.authBadge}>
          <Text style={styles.authBadgeText}>Session Verified</Text>
        </View>
      </View>

      <View style={styles.signatureBox}>
        <View style={styles.signLineContainer}>
          <Text style={styles.signerName}>{signerName}</Text>
          <View style={styles.signLine} />
        </View>
        <View style={styles.verifiedRow}>
          <Ionicons name="checkmark-circle" size={14} color="#00B894" />
          <Text style={styles.verifiedText}>Digitally authorized via vendor credentials</Text>
        </View>
      </View>

      <View style={styles.disclaimerBox}>
        <Ionicons name="information-circle-outline" size={14} color="#8C827A" />
        <Text style={styles.disclaimerText}>
          Direct signature canvas capture is not integrated on the platform service; submissions are authenticated through your JWT session.
        </Text>
      </View>
    </View>
  );
};

export default InvoiceSignatureNotice;

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
    justifyContent: "space-between",
    marginBottom: 14,
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  authBadge: {
    backgroundColor: "#E6FBF5",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  authBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#00B894",
  },
  signatureBox: {
    backgroundColor: "#FAF7F5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ECE6E1",
  },
  signLineContainer: {
    marginBottom: 10,
  },
  signerName: {
    fontSize: 16,
    fontWeight: "700",
    fontStyle: "italic",
    color: "#1F1D1B",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  signLine: {
    height: 1,
    backgroundColor: "#D6CCC5",
    width: "70%",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#00B894",
  },
  disclaimerBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingHorizontal: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: "#8C827A",
    lineHeight: 15,
  },
});
