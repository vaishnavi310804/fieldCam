import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";

export type InviteMethodOption = "Email" | "SMS";

export interface AddStaffFormData {
  name: string;
  phone: string;
  email: string;
}

export interface AddStaffFormProps {
  onSubmit: (data: AddStaffFormData) => void;
  isLoading: boolean;
}

export const AddStaffForm = ({ onSubmit, isLoading }: AddStaffFormProps) => {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [inviteMethod, setInviteMethod] = useState<InviteMethodOption>("Email");

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (isLoading) return;
    setValidationError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setValidationError("Please enter a valid staff name (at least 2 characters).");
      return;
    }

    if (!trimmedPhone) {
      setValidationError("Please enter a phone number.");
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    onSubmit({
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
    });
  };

  return (
    <View style={styles.formContainer}>
      {/* VALIDATION ERROR BANNER */}
      {validationError ? (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
          <Text style={styles.errorText}>{validationError}</Text>
        </View>
      ) : null}

      {/* CARD 1: STAFF DETAILS */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="people-outline" size={18} color="#374151" />
          <Text style={styles.cardTitle}>Staff Details</Text>
        </View>

        {/* STAFF NAME FIELD */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Staff Name</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.textInput}
              placeholder="Enter full name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* PHONE NUMBER FIELD */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <View style={styles.inputBox}>
            <Ionicons name="call-outline" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.textInput}
              placeholder="+1 (555) 000-0000"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* EMAIL ADDRESS FIELD */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.textInput}
              placeholder="email@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* FIXED ROLE FIELD */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Role</Text>
          <View style={[styles.inputBox, styles.readOnlyInputBox]}>
            <Ionicons name="briefcase-outline" size={18} color="#9CA3AF" />
            <Text style={styles.roleValueText}>Field Worker / Staff</Text>
          </View>
        </View>
      </View>

      {/* CARD 2: INVITE METHOD */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="navigate-outline" size={18} color="#374151" />
          <Text style={styles.cardTitle}>Invite Method</Text>
        </View>

        {/* TWO SELECTION CARDS SIDE BY SIDE */}
        <View style={styles.inviteRow}>
          {/* SMS Option */}
          <Pressable
            style={[
              styles.inviteOptionCard,
              inviteMethod === "SMS" && styles.inviteOptionCardSelected,
            ]}
            onPress={() => setInviteMethod("SMS")}
            disabled={isLoading}
          >
            <View
              style={[
                styles.inviteIconCircle,
                inviteMethod === "SMS" && styles.inviteIconCircleSelected,
              ]}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={inviteMethod === "SMS" ? "#8C827A" : "#9CA3AF"}
              />
            </View>
            <Text
              style={[
                styles.inviteOptionTitle,
                inviteMethod === "SMS" && styles.inviteOptionTitleSelected,
              ]}
            >
              SMS
            </Text>
            <Text style={styles.inviteOptionSub}>Send via text message</Text>
          </Pressable>

          {/* Email Option */}
          <Pressable
            style={[
              styles.inviteOptionCard,
              inviteMethod === "Email" && styles.inviteOptionCardSelected,
            ]}
            onPress={() => setInviteMethod("Email")}
            disabled={isLoading}
          >
            <View
              style={[
                styles.inviteIconCircle,
                inviteMethod === "Email" && styles.inviteIconCircleSelected,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={inviteMethod === "Email" ? "#8C827A" : "#9CA3AF"}
              />
            </View>
            <Text
              style={[
                styles.inviteOptionTitle,
                inviteMethod === "Email" && styles.inviteOptionTitleSelected,
              ]}
            >
              Email
            </Text>
            <Text style={styles.inviteOptionSub}>Send via email invite</Text>
          </Pressable>
        </View>

        {/* INFORMATIONAL MESSAGE BOX */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.infoBoxText}>
            {inviteMethod === "Email"
              ? "An email invitation with a signup link and registration OTP will be sent to the staff member's email address."
              : "A text message notification will be prepared for the staff member's phone number. (Note: Email signup link is also sent)."}
          </Text>
        </View>
      </View>

      {/* SUBMIT BUTTON */}
      <Pressable
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel="Send Invite"
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="navigate-outline" size={18} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Send Invite</Text>
          </>
        )}
      </Pressable>

      <Text style={styles.subtextNotice}>
        The staff member will receive a link to set up their account
      </Text>
    </View>
  );
};

export default AddStaffForm;

const styles = StyleSheet.create({
  formContainer: {
    paddingBottom: 40,
  },
  errorCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF7F5",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#F0ECE9",
  },
  readOnlyInputBox: {
    backgroundColor: "#F3EFEA",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
    padding: 0,
  },
  roleValueText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },

  /* INVITE METHOD SECTION */
  inviteRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  inviteOptionCard: {
    flex: 1,
    backgroundColor: "#FAF7F5",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F0ECE9",
  },
  inviteOptionCardSelected: {
    borderColor: "#8C827A",
    backgroundColor: "#FFFFFF",
  },
  inviteIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3EFEA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  inviteIconCircleSelected: {
    backgroundColor: "#EFECE8",
  },
  inviteOptionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 2,
  },
  inviteOptionTitleSelected: {
    color: Colors.black,
  },
  inviteOptionSub: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#FAF7F5",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },

  /* SUBMIT BUTTON */
  submitButton: {
    backgroundColor: "#8C827A",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  subtextNotice: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
  },
});
