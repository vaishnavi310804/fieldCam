import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";

export interface ScoreItem {
  label: string;
  score: number; // 0 - 100
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export interface ScoreBreakdownProps {
  items: ScoreItem[];
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.cardTitle}>Score Breakdown</Text>

      <View style={styles.itemsList}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.labelRow}>
              <View style={styles.labelGroup}>
                <Ionicons name={item.icon} size={16} color={item.color} />
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>
              <Text style={[styles.scoreValue, { color: item.color }]}>
                {item.score}%
              </Text>
            </View>

            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(100, Math.max(0, item.score))}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ScoreBreakdown;

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
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 16,
  },
  itemsList: {
    gap: 16,
  },
  itemRow: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.black,
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  track: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});
