import { Pressable, StyleSheet, Text, View } from "react-native";

export interface TicketPrioritySelectorProps {
  selectedPriority: string;
  onSelectPriority: (priority: string) => void;
  disabled?: boolean;
}

const PRIORITIES = [
  {
    key: "Low",
    label: "Low",
    activeBg: "#DCFCE7",
    activeBorder: "#86EFAC",
    activeText: "#166534",
  },
  {
    key: "Medium",
    label: "Medium",
    activeBg: "#FEF9C3",
    activeBorder: "#FDE047",
    activeText: "#854D0E",
  },
  {
    key: "High",
    label: "High",
    activeBg: "#FEE2E2",
    activeBorder: "#FCA5A5",
    activeText: "#991B1B",
  },
  {
    key: "Urgent",
    label: "Urgent",
    activeBg: "#F3E8FF",
    activeBorder: "#D8B4FE",
    activeText: "#6B21A8",
  },
];

export const TicketPrioritySelector = ({
  selectedPriority,
  onSelectPriority,
  disabled = false,
}: TicketPrioritySelectorProps) => {
  return (
    <View style={styles.container}>
      {PRIORITIES.map((prio) => {
        const isSelected = selectedPriority === prio.key;

        return (
          <Pressable
            key={prio.key}
            style={[
              styles.priorityPill,
              isSelected && {
                backgroundColor: prio.activeBg,
                borderColor: prio.activeBorder,
              },
            ]}
            onPress={() => onSelectPriority(prio.key)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Priority ${prio.label}`}
          >
            <Text
              style={[
                styles.priorityText,
                { color: isSelected ? prio.activeText : "#6E6762" },
              ]}
            >
              {prio.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default TicketPrioritySelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 4,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#EAE4DF",
    alignItems: "center",
    justifyContent: "center",
  },
  priorityText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
