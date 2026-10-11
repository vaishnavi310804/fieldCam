import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { InvoiceOverviewItem } from "@/src/api/invoices.api";

interface EarningsTrendProps {
  overviewData: InvoiceOverviewItem[];
  selectedYear?: number;
}

const { width: screenWidth } = Dimensions.get("window");

export const EarningsTrend: React.FC<EarningsTrendProps> = ({
  overviewData,
  selectedYear = new Date().getFullYear(),
}) => {
  // Map monthly data across the 12 calendar months of the selected year
  const monthlyAmounts = Array(12).fill(0);

  overviewData.forEach((item) => {
    if (item.year === selectedYear && item.monthNum >= 1 && item.monthNum <= 12) {
      monthlyAmounts[item.monthNum - 1] += item.amount;
    }
  });

  const hasAnyData = monthlyAmounts.some((amt) => amt > 0);

  const chartData = monthlyAmounts.map((val, idx) => ({
    value: val,
    label: String(idx + 1),
  }));

  const axisLabels = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const chartWidth = Math.max(screenWidth - 72, 280);
  const spacing = Math.floor((chartWidth - 24) / 12);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Earnings Trend</Text>

      <View style={styles.chartArea}>
        {hasAnyData ? (
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              height={85}
              width={chartWidth}
              color="#A3968C"
              thickness={2.5}
              curved
              hideRules
              hideYAxisText
              hideAxesAndRules
              yAxisThickness={0}
              xAxisThickness={0}
              hideDataPoints={false}
              dataPointsColor="#8C827A"
              dataPointsRadius={2.5}
              initialSpacing={12}
              endSpacing={12}
              spacing={spacing}
              isAnimated={false}
            />
          </View>
        ) : (
          <View style={styles.emptyChartArea}>
            <Text style={styles.emptyText}>No earnings recorded for {selectedYear}</Text>
          </View>
        )}

        {/* 1 to 12 Bottom Axis Numbers */}
        <View style={styles.axisRow}>
          {axisLabels.map((lbl) => (
            <Text key={lbl} style={styles.axisLabel}>
              {lbl}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

export default EarningsTrend;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F1D1B",
    marginBottom: 12,
  },
  chartArea: {
    minHeight: 120,
    justifyContent: "flex-end",
  },
  chartWrapper: {
    height: 95,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  emptyChartArea: {
    height: 85,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    borderRadius: 12,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8C827A",
  },
  axisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, 0.06)",
  },
  axisLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#A8A29E",
    width: 20,
    textAlign: "center",
  },
});
