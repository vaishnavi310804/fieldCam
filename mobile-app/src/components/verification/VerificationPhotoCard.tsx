import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface VerificationPhotoCardProps {
  imageUri?: string;
  status: "PASSED" | "FAILED" | "PENDING";
  categoryLabel?: string;
}

export const VerificationPhotoCard: React.FC<VerificationPhotoCardProps> = ({
  imageUri,
  status,
  categoryLabel,
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case "PASSED":
        return {
          bg: "#10B981",
          icon: "checkmark",
          text: "Pass",
        };
      case "FAILED":
        return {
          bg: "#EF4444",
          icon: "close",
          text: "Failed",
        };
      case "PENDING":
      default:
        return {
          bg: "#F59E0B",
          icon: "time-outline",
          text: "Pending",
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <View style={styles.cardContainer}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.photoImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="image-outline" size={48} color="#A39A94" />
          <Text style={styles.placeholderText}>
            {categoryLabel || "Inspection Photo"}
          </Text>
        </View>
      )}

      {/* Top Right Status Badge Overlay */}
      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
        <Ionicons name={badge.icon as any} size={14} color="#FFFFFF" />
        <Text style={styles.statusBadgeText}>{badge.text}</Text>
      </View>
    </View>
  );
};

export default VerificationPhotoCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    position: "relative",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAE4DF",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 13,
    color: "#817B77",
    fontWeight: "600",
  },
  statusBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    elevation: 2,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
