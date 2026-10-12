import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const InvoiceUploadNotice: React.FC = () => {
  const handleUploadPress = () => {
    Alert.alert(
      "Document Upload Unavailable",
      "Custom invoice document upload and automated parsing is currently in development. Please use the digital invoice generator above to ensure immediate review and approval.",
      [{ text: "OK" }]
    );
  };

  return (
    <Pressable style={styles.card} onPress={handleUploadPress}>
      <View style={styles.iconCircle}>
        <Ionicons name="cloud-upload-outline" size={20} color="#D97706" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Upload Custom Invoice</Text>
        <Text style={styles.subtitle}>PDF, PNG, or JPEG — max 10 MB</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#A8A29E" />
    </Pressable>
  );
};

export default InvoiceUploadNotice;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EAE5E1",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
    fontSize: 11,
    fontWeight: "500",
    color: "#8C827A",
  },
});
