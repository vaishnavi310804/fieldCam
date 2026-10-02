import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface TimelineStepItem {
  id: string;
  title: string;
  description?: string;
  dateText?: string;
  status: "completed" | "current" | "pending";
}

interface ProjectTimelineItemProps {
  item: TimelineStepItem;
  isFirst: boolean;
  isLast: boolean;
  prevCompleted?: boolean;
}

export const ProjectTimelineItem: React.FC<ProjectTimelineItemProps> = ({
  item,
  isFirst,
  isLast,
  prevCompleted = false,
}) => {
  const isCompleted = item.status === "completed";
  const isCurrent = item.status === "current";
  const isPending = item.status === "pending";

  // Color selection matching reference design
  const dotColor = isCompleted
    ? "#16A34A"
    : isCurrent
    ? "#786C62"
    : "#E5E7EB";

  const topLineColor = prevCompleted || isCompleted ? "#16A34A" : "#E5E7EB";
  const bottomLineColor = isCompleted ? "#16A34A" : "#E5E7EB";

  const dateColor = isPending ? "#9CA3AF" : "#8C7E72";
  const titleColor = isPending ? "#9CA3AF" : "#1F2937";
  const descColor = isPending ? "#9CA3AF" : "#6B7280";

  return (
    <View style={styles.container}>
      {/* LEFT TIMELINE COLUMN */}
      <View style={styles.timelineColumn}>
        {/* Top Connecting Line */}
        {!isFirst && (
          <View
            style={[
              styles.line,
              styles.topLine,
              { backgroundColor: topLineColor },
            ]}
          />
        )}

        {/* Timeline Node Dot */}
        <View style={[styles.dot, { backgroundColor: dotColor }]} />

        {/* Bottom Connecting Line */}
        {!isLast && (
          <View
            style={[
              styles.line,
              styles.bottomLine,
              { backgroundColor: bottomLineColor },
            ]}
          />
        )}
      </View>

      {/* RIGHT CONTENT COLUMN */}
      <View style={styles.contentColumn}>
        {item.dateText ? (
          <Text style={[styles.dateText, { color: dateColor }]}>
            {item.dateText}
          </Text>
        ) : null}

        <Text style={[styles.titleText, { color: titleColor }]}>
          {item.title}
        </Text>

        {item.description ? (
          <Text style={[styles.descriptionText, { color: descColor }]}>
            {item.description}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default ProjectTimelineItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 70,
  },
  timelineColumn: {
    width: 36,
    alignItems: "center",
    alignSelf: "stretch",
    position: "relative",
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 3,
    zIndex: 2,
  },
  line: {
    width: 2,
    position: "absolute",
    left: 17,
    zIndex: 1,
  },
  topLine: {
    top: 0,
    height: 12,
  },
  bottomLine: {
    top: 18,
    bottom: 0,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 28,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 3,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
});
