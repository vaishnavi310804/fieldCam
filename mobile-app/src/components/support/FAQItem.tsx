import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface FAQItemProps {
  question: string;
  onPress?: () => void;
}

export const FAQItem = ({ question, onPress }: FAQItemProps) => {
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={question}
    >
      <View style={styles.leftRow}>
        <View style={styles.iconWrapper}>
          <Ionicons name="help-circle-outline" size={18} color="#3B82F6" />
        </View>
        <Text style={styles.questionText} numberOfLines={2}>
          {question}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#A39A94" />
    </Pressable>
  );
};

export default FAQItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  questionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2724",
    flex: 1,
  },
});
