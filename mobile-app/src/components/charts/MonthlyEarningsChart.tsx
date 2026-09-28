import { StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Colors from "@/src/constants/color";

export type MonthlyEarningsPoint = {
  label?: string;
  value: number;
};

export interface MonthlyEarningsChartProps {
  data: MonthlyEarningsPoint[];
}

export const MonthlyEarningsChart = ({
  data,
}: MonthlyEarningsChartProps) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const hasNonZeroValues =
    hasData && data.some((point) => point.value > 0);

  if (!hasData || !hasNonZeroValues) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No monthly trend data available
        </Text>
      </View>
    );
  }

  const formattedData = data.map((point, index) => {
    const isLatest = index === data.length - 1;

    return {
      value: point.value,
      label: point.label,
      frontColor: isLatest
        ? "#797979"
        : "rgba(0, 0, 0, 0.15)",
      topLabelComponent: () => null,
    };
  });

  return (
    <View style={styles.chartContainer}>
      <BarChart
        data={formattedData}
        height={42}
        barWidth={14}
        spacing={12}
        capRadius={4}
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
  );
};

export default MonthlyEarningsChart;

const styles = StyleSheet.create({
  chartContainer: {
    height: 48,
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
    overflow: "hidden",
  },

  emptyContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 8,
    marginTop: 8,
  },

  emptyText: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: "500",
  },
});