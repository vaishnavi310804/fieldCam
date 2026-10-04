import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type UploadStatus = "pending" | "uploading" | "uploaded" | "failed";

export interface UploadProgressRowProps {
  categoryLabel: string;
  imageUri?: string;
  status: UploadStatus;
  errorMessage?: string;
  onRetry?: () => void;
}

export const UploadProgressRow: React.FC<UploadProgressRowProps> = ({
  categoryLabel,
  imageUri,
  status,
  errorMessage,
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Ionicons name="image-outline" size={20} color="#9CA3AF" />
          </View>
        )}
      </View>

      {/* Info & Status */}
      <View style={styles.infoCol}>
        <Text style={styles.categoryTitle} numberOfLines={1}>
          {categoryLabel}
        </Text>

        <View style={styles.statusRow}>
          {status === "uploading" && (
            <View style={styles.statusBadgeUploading}>
              <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={styles.statusTextUploading}>Uploading...</Text>
            </View>
          )}

          {status === "uploaded" && (
            <View style={styles.statusBadgeSuccess}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              <Text style={styles.statusTextSuccess}>Uploaded</Text>
            </View>
          )}

          {status === "pending" && (
            <View style={styles.statusBadgePending}>
              <Ionicons name="time-outline" size={15} color="#6B7280" />
              <Text style={styles.statusTextPending}>Pending</Text>
            </View>
          )}

          {status === "failed" && (
            <View style={styles.statusBadgeFailed}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.statusTextFailed}>Upload Failed</Text>
            </View>
          )}
        </View>

        {status === "failed" && errorMessage ? (
          <Text style={styles.errorMessage} numberOfLines={2}>
            {errorMessage}
          </Text>
        ) : null}
      </View>

      {/* Retry Button if Failed */}
      {status === "failed" && onRetry ? (
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry Upload"
        >
          <Ionicons name="refresh" size={16} color="#2563EB" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default UploadProgressRow;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  thumbnailContainer: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  placeholderThumbnail: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCol: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadgeUploading: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusTextUploading: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  statusBadgeSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusTextSuccess: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
  },
  statusBadgePending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusTextPending: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  statusBadgeFailed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusTextFailed: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  errorMessage: {
    fontSize: 11,
    color: "#EF4444",
    marginTop: 4,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginLeft: 8,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
});
