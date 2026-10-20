import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";
import { formatCurrency } from "@/src/utils/currency.utils";

export type EarningsPeriod = "Week" | "Month" | "Year";

interface EarningsSummaryProps {
  period: EarningsPeriod;
  onSelectPeriod: (p: EarningsPeriod) => void;
  totalAmount: number;
  periodSubtitle: string;
  momChange: { percent: number; isPositive: boolean } | null;
}

export const EarningsSummary: React.FC<EarningsSummaryProps> = ({
  period,
  onSelectPeriod,
  totalAmount,
  periodSubtitle,
  momChange,
}) => {
  const insets = useSafeAreaInsets();

  const handleNewInvoicePress = () => {
    router.push("/(app)/raise-invoice");
  };

  const periods: EarningsPeriod[] = ["Week", "Month", "Year"];

  return (
    <LinearGradient
      colors={["#D8CCC2", "#C2B2A5", "#A8988B"]}
      start={{ x: 0.8, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[
        styles.gradientHeader,
        { paddingTop: Math.max(insets.top, 16) + 12 },
      ]}
    >
      {/* Title Row */}
      <View style={styles.titleRow}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#1F1D1B" />
        </Pressable>

        <Text style={styles.screenTitle}>Earnings</Text>

        <View style={styles.titleRightSpacer} />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>{periodSubtitle}</Text>

      {/* Total Amount & MoM Indicator */}
      <View style={styles.amountRow}>
        <Text style={styles.amountText}>{formatCurrency(totalAmount)}</Text>
        {momChange !== null && (
          <View style={styles.momBadge}>
            <Text
              style={[
                styles.momText,
                momChange.isPositive ? styles.momPositive : styles.momNegative,
              ]}
            >
              {momChange.isPositive ? "↗ +" : "↘ "}
              {Math.abs(momChange.percent)}% vs last month
            </Text>
          </View>
        )}
      </View>

      {/* Controls Row: Period Selector + New Invoice Action */}
      <View style={styles.controlsRow}>
        <View style={styles.periodPillsContainer}>
          {periods.map((p) => {
            const isActive = period === p;
            return (
              <Pressable
                key={p}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => onSelectPeriod(p)}
              >
                <Text
                  style={[styles.pillText, isActive && styles.pillTextActive]}
                >
                  {p}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={styles.newInvoiceButton}
          onPress={handleNewInvoicePress}
        >
          <Text style={styles.newInvoiceText}>+ New Invoice</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

export default EarningsSummary;

const styles = StyleSheet.create({
  gradientHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    marginBottom: 20,
    minHeight: 28,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  screenTitle: {
    position: "absolute",
    left: 40,
    right: 40,
    fontSize: 22,
    fontWeight: "700",
    color: "#0F0F0F",
    textAlign: "center",
  },

  titleRightSpacer: {
    width: 40,
    height: 36,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6E655F",
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    marginBottom: 20,
  },
  amountText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1F1D1B",
    letterSpacing: -0.5,
  },
  momBadge: {
    alignSelf: "center",
  },
  momText: {
    fontSize: 12,
    fontWeight: "600",
  },
  momPositive: {
    color: "#2D6A4F",
  },
  momNegative: {
    color: "#C92A2A",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  periodPillsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.07)",
    borderRadius: 22,
    padding: 3,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  pillActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.white,
  },
  pillTextActive: {
    color: "#1F1D1B",
    fontWeight: "700",
  },
  newInvoiceButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  newInvoiceText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
  },
});
