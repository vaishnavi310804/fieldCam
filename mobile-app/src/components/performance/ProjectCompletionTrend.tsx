import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarChart } from "react-native-gifted-charts";
import Colors from "@/src/constants/color";

export type CompletionTrendPoint = {
  label: string;
  value: number;
};

export interface ProjectCompletionTrendProps {
  data: CompletionTrendPoint[];
  subLabel?: string;
}

export const ProjectCompletionTrend: React.FC<ProjectCompletionTrendProps> = ({
  data,
  subLabel = "Project Completions",
}) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const hasNonZeroValues = hasData && data.some((item) => item.value > 0);

  const formattedData = hasData
    ? data.map((item, index) => {
        const isLast = index === data.length - 1;
        return {
          value: item.value,
          label: item.label,
          frontColor: isLast ? Colors.primary : "#D6C6BB",
          topLabelComponent: () =>
            item.value > 0 ? (
              <Text style={styles.topLabelText}>{item.value}</Text>
            ) : null,
        };
      })
    : [];

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="bar-chart-outline" size={18} color="#6B5E54" />
          <Text style={styles.cardTitle}>Project Completion Trend</Text>
        </View>
        <Text style={styles.subLabelText}>{subLabel}</Text>
      </View>

      {!hasData || !hasNonZeroValues ? (
        <View style={styles.emptyBox}>
          <Ionicons name="folder-open-outline" size={28} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            No project completion data for this period
          </Text>
        </View>
      ) : (
        <View style={styles.chartWrapper}>
          <BarChart
            data={formattedData}
            height={130}
            barWidth={24}
            spacing={20}
            capRadius={6}
            roundedTop
            hideRules
            hideYAxisText
            hideAxesAndRules
            yAxisThickness={0}
            xAxisThickness={0}
            disablePress
            isAnimated={false}
          />
        </View>
      )}
    </View>
  );
};

export default ProjectCompletionTrend;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },
  subLabelText: {
    fontSize: 12,
    color: "#6B7280",
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 4,
  },
  topLabelText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
    textAlign: "center",
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});
