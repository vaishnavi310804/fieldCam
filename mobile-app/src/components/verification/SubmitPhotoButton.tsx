import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";

export interface SubmitPhotoButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  status?: "PASSED" | "FAILED" | "PENDING";
}

export const SubmitPhotoButton: React.FC<SubmitPhotoButtonProps> = ({
  onPress,
  isLoading = false,
  disabled = false,
  status = "PASSED",
}) => {
  const isFailed = status === "FAILED";

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          isFailed ? styles.failedButton : styles.primaryButton,
          (disabled || isLoading) && styles.disabledButton,
        ]}
        onPress={onPress}
        disabled={disabled || isLoading}
        accessibilityRole="button"
        accessibilityLabel="Submit Photo"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons
              name={isFailed ? "alert-circle-outline" : "checkmark-circle-outline"}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.buttonText}>
              {isFailed ? "Submit for Review" : "Submit Photo"}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
};

export default SubmitPhotoButton;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  failedButton: {
    backgroundColor: "#374151",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
