import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface TicketAttachmentPickerProps {
  disabled?: boolean;
}

export const TicketAttachmentPicker = ({ disabled = false }: TicketAttachmentPickerProps) => {
  const handlePress = () => {
    Alert.alert(
      "Ticket Attachments",
      "Ticket file uploads are coming soon. Please describe your issue in detail in the description field."
    );
  };

  return (
    <Pressable
      style={styles.pickerContainer}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Add screenshots or files"
    >
      <View style={styles.iconCircle}>
        <Ionicons name="add" size={24} color="#9C958E" />
      </View>
      <Text style={styles.pickerText}>Add screenshots or files</Text>
    </Pressable>
  );
};

export default TicketAttachmentPicker;

const styles = StyleSheet.create({
  pickerContainer: {
    backgroundColor: "#F3EFEA",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#EAE4DF",
    borderStyle: "dashed",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  pickerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#817B77",
  },
});
