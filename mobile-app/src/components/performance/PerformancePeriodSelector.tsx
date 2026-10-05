import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/src/constants/color";

export type PerformancePeriod = "weekly" | "monthly" | "yearly";

export interface PerformancePeriodSelectorProps {
  selectedPeriod: PerformancePeriod;
  onSelectPeriod: (period: PerformancePeriod) => void;
}

export const PerformancePeriodSelector: React.FC<
  PerformancePeriodSelectorProps
> = ({ selectedPeriod, onSelectPeriod }) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.tabButton,
          selectedPeriod === "weekly" && styles.activeTabButton,
        ]}
        onPress={() => onSelectPeriod("weekly")}
        accessibilityRole="button"
        accessibilityLabel="Weekly performance"
      >
        <Text
          style={[
            styles.tabText,
            selectedPeriod === "weekly" && styles.activeTabText,
          ]}
        >
          Weekly
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.tabButton,
          selectedPeriod === "monthly" && styles.activeTabButton,
        ]}
        onPress={() => onSelectPeriod("monthly")}
        accessibilityRole="button"
        accessibilityLabel="Monthly performance"
      >
        <Text
          style={[
            styles.tabText,
            selectedPeriod === "monthly" && styles.activeTabText,
          ]}
        >
          Monthly
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.tabButton,
          selectedPeriod === "yearly" && styles.activeTabButton,
        ]}
        onPress={() => onSelectPeriod("yearly")}
        accessibilityRole="button"
        accessibilityLabel="Yearly performance"
      >
        <Text
          style={[
            styles.tabText,
            selectedPeriod === "yearly" && styles.activeTabText,
          ]}
        >
          Yearly
        </Text>
      </Pressable>
    </View>
  );
};

export default PerformancePeriodSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#EFECE8",
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabButton: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: Colors.black,
    fontWeight: "700",
  },
});
