import React from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";

export interface EditProfileFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  required?: boolean;
  readOnly?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  showCharCounter?: boolean;
  helperText?: string;
  errorText?: string;
}

export const EditProfileField: React.FC<EditProfileFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  required = false,
  readOnly = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  maxLength,
  multiline = false,
  numberOfLines = 1,
  showCharCounter = false,
  helperText,
  errorText,
}) => {
  const isOverLimit = maxLength ? value.length > maxLength : false;

  return (
    <View style={styles.container}>
      {/* Label Row */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.requiredStar}> *</Text> : null}
        </Text>
        {showCharCounter && maxLength ? (
          <Text
            style={[
              styles.charCounter,
              isOverLimit ? styles.charCounterError : null,
            ]}
          >
            {value.length}/{maxLength}
          </Text>
        ) : null}
      </View>

      {/* Input Box */}
      <View
        style={[
          styles.inputBox,
          readOnly ? styles.readOnlyInputBox : null,
          multiline ? styles.multilineInputBox : null,
          errorText ? styles.inputBoxError : null,
        ]}
      >
        {icon ? (
          <View style={[styles.iconWrapper, multiline ? styles.multilineIconWrapper : null]}>
            <Ionicons
              name={icon}
              size={18}
              color={readOnly ? "#9CA3AF" : "#8C827A"}
            />
          </View>
        ) : null}

        <TextInput
          style={[
            styles.textInput,
            readOnly ? styles.readOnlyTextInput : null,
            multiline ? styles.multilineTextInput : null,
          ]}
          value={value}
          onChangeText={readOnly ? undefined : onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A39A94"
          editable={!readOnly}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? "top" : "center"}
        />

      </View>

      {/* Helper text or Error message */}
      {errorText ? (
        <View style={styles.messageRow}>
          <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

export default EditProfileField;

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B443F",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  requiredStar: {
    color: "#EF4444",
  },
  charCounter: {
    fontSize: 11,
    color: "#8C827A",
    fontWeight: "600",
  },
  charCounterError: {
    color: "#EF4444",
    fontWeight: "700",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF7F5",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#EAE4DF",
    gap: 10,
  },
  readOnlyInputBox: {
    backgroundColor: "#F3EFEA",
    borderColor: "#E5DFD9",
  },
  multilineInputBox: {
    alignItems: "flex-start",
    minHeight: 110,
    paddingVertical: 12,
  },
  inputBoxError: {
    borderColor: "#EF4444",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: 20,
  },
  multilineIconWrapper: {
    marginTop: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
    padding: 0,
  },
  readOnlyTextInput: {
    color: "#6B7280",
    fontWeight: "500",
  },
  multilineTextInput: {
    minHeight: 90,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E5DFD9",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
    marginLeft: 2,
  },
  errorText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "600",
  },
  helperText: {
    fontSize: 11,
    color: "#817B77",
    marginTop: 5,
    marginLeft: 2,
    lineHeight: 15,
  },
});
