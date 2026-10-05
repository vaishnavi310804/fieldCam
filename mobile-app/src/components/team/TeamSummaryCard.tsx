import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/src/constants/color";

export interface TeamSummaryCardProps {
  count: number;
  label: string;
  dotColor: string;
}

export const TeamSummaryCard = ({
  count,
  label,
  dotColor,
}: TeamSummaryCardProps) => {
  return (
    <View style={styles.cardContainer}>
      <Text style={styles.countText}>{count}</Text>
      <View style={styles.labelRow}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
    </View>
  );
};

export default TeamSummaryCard;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  countText: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.black,
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
});
