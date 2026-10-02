import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface TicketCategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  disabled?: boolean;
}

const CATEGORIES = [
  { id: "General", label: "General" },
  { id: "Technical Issue", label: "Technical Issue" },
  { id: "Billing", label: "Billing" },
  { id: "Account", label: "Account" },
  { id: "Feature Request", label: "Feature Request" },
];

export const TicketCategorySelector = ({
  selectedCategory,
  onSelectCategory,
  disabled = false,
}: TicketCategorySelectorProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (catId: string) => {
    onSelectCategory(catId);
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        style={styles.fieldContainer}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Category: ${selectedCategory}`}
      >
        <Text style={styles.valueText}>{selectedCategory || "Select Category"}</Text>
        <Ionicons name="chevron-down" size={18} color="#817B77" />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#6E6762" />
              </Pressable>
            </View>

            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                  ]}
                  onPress={() => handleSelect(cat.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                  {isSelected ? (
                    <Ionicons name="checkmark" size={18} color="#928880" />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default TicketCategorySelector;

const styles = StyleSheet.create({
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  valueText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2724",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#EAE4DF",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C2724",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  optionRowSelected: {
    backgroundColor: "#FAF7F5",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A423F",
  },
  optionTextSelected: {
    fontWeight: "700",
    color: "#2C2724",
  },
});
