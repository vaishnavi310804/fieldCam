import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface PhotoGridCardProps {
  type?: "photo" | "add_more";
  imageUri?: string;
  categoryLabel?: string;
  isBackendUploaded?: boolean;
  onRetake?: () => void;
  onDelete?: () => void;
  onAddMore?: () => void;
}

export const PhotoGridCard: React.FC<PhotoGridCardProps> = ({
  type = "photo",
  imageUri,
  categoryLabel,
  isBackendUploaded = false,
  onRetake,
  onDelete,
  onAddMore,
}) => {
  if (type === "add_more") {
    return (
      <Pressable
        style={styles.addMoreCard}
        onPress={onAddMore}
        accessibilityRole="button"
        accessibilityLabel="Add More Photos"
      >
        <View style={styles.addMoreIconCircle}>
          <Ionicons name="add" size={24} color="#2563EB" />
        </View>
        <Text style={styles.addMoreText}>Add More</Text>
      </Pressable>
    );
  }

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
          <Ionicons name="image-outline" size={32} color="#9CA3AF" />
        </View>
      )}

      {/* Top-Right Action Buttons Overlay */}
      <View style={styles.actionOverlayRow}>
        {onRetake ? (
          <Pressable
            style={styles.actionIconButton}
            onPress={onRetake}
            accessibilityRole="button"
            accessibilityLabel="Retake photo"
          >
            <Ionicons name="refresh-outline" size={14} color="#2563EB" />
          </Pressable>
        ) : null}

        {onDelete && !isBackendUploaded ? (
          <Pressable
            style={[styles.actionIconButton, styles.deleteIconButton]}
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete photo"
          >
            <Ionicons name="trash-outline" size={14} color="#EF4444" />
          </Pressable>
        ) : null}
      </View>

      {/* Bottom Category Label Badge */}
      {categoryLabel ? (
        <View style={styles.categoryLabelBadge}>
          <Text style={styles.categoryLabelText} numberOfLines={1}>
            {categoryLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default PhotoGridCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: "48%",
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    position: "relative",
    borderWidth: 1,
    borderColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  actionOverlayRow: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 6,
    zIndex: 5,
  },
  actionIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteIconButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  categoryLabelBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryLabelText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  addMoreCard: {
    width: "48%",
    height: 180,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    borderStyle: "dashed",
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addMoreIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  addMoreText: {
    color: "#1E40AF",
    fontSize: 13,
    fontWeight: "700",
  },
});
