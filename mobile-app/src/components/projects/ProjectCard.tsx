import { Image, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";

export interface ProjectCardData {
  id: string;
  projectId: string;
  projectName?: string;
  location: string;
  status: string;
  imageUrl?: string;
  progress?: number;
}

export interface ProjectCardProps {
  project: ProjectCardData;
  onPress?: () => void;
  onAcceptPress?: () => void;
  showAcceptButton?: boolean;
}

const getStatusBadgeStyle = (status: string) => {
  const normalized = status.trim().toLowerCase();

  switch (normalized) {
    case "in progress":
    case "inprogress":
      return {
        bg: "#FEF9C3",
        text: "#854D0E",
        dot: "#CA8A04",
        label: "In Progress",
      };
    case "new":
    case "assigned":
      return {
        bg: "#DBEAFE",
        text: "#1E40AF",
        dot: "#2563EB",
        label: status.toUpperCase() === "ASSIGNED" ? "Assigned" : "New",
      };
    case "submitted":
    case "under review":
    case "underreview":
      return {
        bg: "#F3E8FF",
        text: "#6B21A8",
        dot: "#7C3AED",
        label: "Submitted",
      };
    case "completed":
    case "approved":
    case "active":
      return {
        bg: "#DCFCE7",
        text: "#166534",
        dot: "#16A34A",
        label: status.toUpperCase() === "ACTIVE" ? "Active" : "Completed",
      };
    case "rejected":
      return {
        bg: "#FEE2E2",
        text: "#991B1B",
        dot: "#DC2626",
        label: "Rejected",
      };
    default:
      return {
        bg: "#F3F4F6",
        text: "#374151",
        dot: "#6B7280",
        label: status,
      };
  }
};

export const ProjectCard = ({
  project,
  onPress,
  onAcceptPress,
  showAcceptButton = false,
}: ProjectCardProps) => {
  const badge = getStatusBadgeStyle(project.status);
  const statusUpper = (project.status || "").toUpperCase();
  const isPendingAcceptance = statusUpper === "NEW" || statusUpper === "ASSIGNED";
  const hasProgress = !isPendingAcceptance && typeof project.progress === "number" && !isNaN(project.progress);

  return (
    <Pressable
      style={styles.cardContainer}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Project ${project.projectId}, ${project.location}`}
    >
      {/* Top Image Banner */}
      <View style={styles.imageContainer}>
        {project.imageUrl ? (
          <Image
            source={{ uri: project.imageUrl }}
            style={styles.projectImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#A39A94" />
          </View>
        )}

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: badge.dot }]} />
          <Text style={[styles.statusText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        {/* Project Code & Chevron */}
        <View style={styles.headerRow}>
          <Text style={styles.projectCodeText}>{project.projectId}</Text>
          <Ionicons name="chevron-forward" size={16} color="#A39A94" />
        </View>

        {/* Location Row */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color="#5C524A" style={styles.locationIcon} />
          <Text style={styles.locationText} numberOfLines={1}>
            {project.location}
          </Text>
        </View>

        {/* Progress Bar (Only rendered if progress numeric value exists) */}
        {hasProgress ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercent}>
                {Math.min(100, Math.max(0, project.progress!))}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.min(100, Math.max(0, project.progress!))}%` },
                ]}
              />
            </View>
          </View>
        ) : null}

        {/* Presentational Accept Button for ASSIGNED projects */}
        {(showAcceptButton || project.status.toUpperCase() === "ASSIGNED") ? (
          <Pressable
            style={styles.acceptButton}
            onPress={onAcceptPress}
            accessibilityRole="button"
            accessibilityLabel="Accept Project"
          >
            <Text style={styles.acceptButtonText}>Accept Project</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
};

export default ProjectCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    height: 160,
    width: "100%",
    position: "relative",
    backgroundColor: "#F2EBE5",
  },
  projectImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAE4DF",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardBody: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  projectCodeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#817B77",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2B2523",
    flex: 1,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#817B77",
    fontWeight: "500",
  },
  progressPercent: {
    fontSize: 12,
    color: "#3E3734",
    fontWeight: "600",
  },
  progressTrack: {
    height: 6,
    width: "100%",
    backgroundColor: "#EAE4DF",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#736458",
    borderRadius: 3,
  },
  acceptButton: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
