import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VendorProjectPhoto } from "@/src/api/dashboard.api";

export interface ReportPhotoEvidenceProps {
  photos?: VendorProjectPhoto[];
}

const formatTime = (dateStr?: string): string => {
  if (!dateStr) return "Time N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Time N/A";
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatGps = (location?: { latitude: number; longitude: number }): string => {
  if (
    !location ||
    typeof location.latitude !== "number" ||
    typeof location.longitude !== "number"
  ) {
    return "GPS N/A";
  }
  const latStr = `${Math.abs(location.latitude).toFixed(4)}° ${location.latitude >= 0 ? "N" : "S"}`;
  const lngStr = `${Math.abs(location.longitude).toFixed(4)}° ${location.longitude >= 0 ? "E" : "W"}`;
  return `${latStr}, ${lngStr}`;
};

export const ReportPhotoEvidence = ({ photos }: ReportPhotoEvidenceProps) => {
  const photoList = Array.isArray(photos) ? photos : [];

  if (photoList.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.headerRow}>
          <Ionicons name="camera-outline" size={18} color="#374151" />
          <Text style={styles.sectionTitle}>Photo Evidence</Text>
        </View>

        <View style={styles.emptyCard}>
          <Ionicons name="images-outline" size={32} color="#A1A1AA" />
          <Text style={styles.emptyTitle}>No Photo Evidence Available</Text>
          <Text style={styles.emptySubtitle}>
            Uploaded project site photos will appear here.
          </Text>
        </View>
      </View>
    );
  }

  // Group photos by category
  const groupedCategories = photoList.reduce<Record<string, VendorProjectPhoto[]>>(
    (acc, photo) => {
      const category = photo.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(photo);
      return acc;
    },
    {}
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <Ionicons name="camera-outline" size={18} color="#374151" />
        <Text style={styles.sectionTitle}>Photo Evidence</Text>
      </View>

      {Object.entries(groupedCategories).map(([categoryName, groupPhotos]) => (
        <View key={categoryName} style={styles.categoryBlock}>
          {/* Category Header */}
          <View style={styles.categoryHeader}>
            <View style={styles.categoryTitleRow}>
              <View style={styles.categoryDot} />
              <Text style={styles.categoryName}>{categoryName}</Text>
            </View>
            <Text style={styles.categoryCountText}>
              {groupPhotos.length} {groupPhotos.length === 1 ? "photo" : "photos"}
            </Text>
          </View>

          {/* Photo Grid */}
          <View style={styles.photoGrid}>
            {groupPhotos.map((photo, index) => {
              const key = photo._id || `photo-${index}`;
              const timeStr = formatTime(photo.capturedAt || photo.uploadedAt);
              const gpsStr = formatGps(photo.location);

              return (
                <View key={key} style={styles.photoCard}>
                  {/* Photo Thumbnail */}
                  <View style={styles.thumbnailContainer}>
                    <Image
                      source={{ uri: photo.url }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                    {/* Category Pill Tag */}
                    <View style={styles.categoryPillTag}>
                      <Text style={styles.categoryPillText} numberOfLines={1}>
                        {categoryName}
                      </Text>
                    </View>
                  </View>

                  {/* Photo Metadata Footer */}
                  <View style={styles.photoMetadata}>
                    {/* Time */}
                    <View style={styles.metaRow}>
                      <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                      <Text style={styles.metaText}>{timeStr}</Text>
                    </View>
                    {/* GPS Coordinates */}
                    <View style={styles.metaRow}>
                      <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {gpsStr}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};

export default ReportPhotoEvidence;

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  categoryBlock: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6B7280",
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  categoryCountText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailContainer: {
    height: 120,
    width: "100%",
    position: "relative",
    backgroundColor: "#E5E7EB",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  categoryPillTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: "85%",
  },
  categoryPillText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  photoMetadata: {
    padding: 10,
    gap: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
    flex: 1,
  },
});
