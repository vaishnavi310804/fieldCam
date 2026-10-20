import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InvoiceSignatureNoticeProps {
  companyName?: string;
  /** @deprecated preserved for backward compatibility */
  signerName?: string;
}

export const InvoiceSignatureNotice: React.FC<InvoiceSignatureNoticeProps> = ({
  companyName,
  signerName,
}) => {
  const authoritativeName =
    companyName || signerName || "Authorized Vendor";

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleWithIcon}>
          <Ionicons name="shield-checkmark-outline" size={17} color="#6E655F" />
          <Text style={styles.sectionTitle}>Digitally Signed By</Text>
        </View>
      </View>

      <View style={styles.authorizationBox}>
        <Text style={styles.companyNameText}>{authoritativeName}</Text>
        <Text style={styles.representativeText}>Authorized company representative</Text>
        <Text style={styles.secondaryText}>
          Digitally authorized through the authenticated FieldCam account.
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
    marginBottom: 12,
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
  authorizationBox: {
    backgroundColor: "#FAF7F5",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECE6E1",
    gap: 4,
  },
  companyNameText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  representativeText: {
    fontSize: 12,
    color: "#6E655F",
    fontWeight: "500",
  },
  secondaryText: {
    fontSize: 11,
    color: "#8C827A",
    fontStyle: "italic",
    marginTop: 4,
    lineHeight: 15,
  },
});
