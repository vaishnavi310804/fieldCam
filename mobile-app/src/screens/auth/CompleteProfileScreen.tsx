import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "@/src/constants/color";
import { completeProfile } from "@/src/api/auth.api";

const CompleteProfileScreen = () => {
  const params = useLocalSearchParams<{
    setupToken?: string;
    email?: string;
    name?: string;
  }>();

  const setupToken = (params.setupToken || "").toString();
  const email = (params.email || "").toString();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const handleCompleteSetup = async () => {
    setErrorMessage(null);

    if (!setupToken) {
      setErrorMessage(
        "Missing setup session. Please verify your OTP again to continue."
      );
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your new password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (!confirmPassword) {
      setErrorMessage("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please check and try again.");
      return;
    }

    try {
      setIsSubmitting(true);
      await completeProfile({
        password,
        setupToken,
      });

      // Show activation success modal
      setIsSuccessModalVisible(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        err?.message ||
        "Failed to set password. Your setup session may have expired.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToLogin = () => {
    setIsSuccessModalVisible(false);
    router.replace("/(auth)/login" as any);
  };

  // Route Guard: If setupToken is missing, require OTP verification first
  if (!setupToken) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace("/(auth)/activate-account" as any)}
            hitSlop={10}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#333333" />
          </Pressable>
        </View>

        <View style={[styles.content, styles.guardContent]}>
          <View style={styles.guardIconCircle}>
            <Ionicons name="alert-circle-outline" size={52} color="#D97706" />
          </View>

          <Text style={styles.guardTitle}>Verification Required</Text>
          <Text style={styles.guardSubtitle}>
            You must verify your email with the 6-digit One-Time Password (OTP)
            before establishing your password.
          </Text>

          <Pressable
            style={styles.guardButton}
            onPress={() => router.replace("/(auth)/activate-account" as any)}
          >
            <Text style={styles.guardButtonText}>Go to Verification</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Back Navigation Bar */}
        <View style={styles.topBar}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={10}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#333333" />
          </Pressable>
        </View>

        {/* Content Body */}
        <View style={styles.content}>
          <Text style={styles.title}>Set Password</Text>
          <Text style={styles.subtitle}>
            Create a secure password to activate your account
            {email ? ` for ${email}` : ""}.
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* New Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter password"
                placeholderTextColor="#A1A1AA"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isSubmitting}
                style={styles.passwordInput}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#9299A5"
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Confirm password"
                placeholderTextColor="#A1A1AA"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!isSubmitting}
                style={styles.passwordInput}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={10}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#9299A5"
                />
              </Pressable>
            </View>
          </View>

          <Text style={styles.hintText}>
            Password must be at least 6 characters long.
          </Text>

          {/* Submit Button */}
          <Pressable
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleCompleteSetup}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.submitText}>Activate Account</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* Account Activation Success Modal */}
      <Modal
        visible={isSuccessModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleReturnToLogin}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successIconCircle}>
              <Ionicons
                name="checkmark-circle-outline"
                size={56}
                color="#16A34A"
              />
            </View>

            <Text style={styles.modalTitle}>Account Activated!</Text>
            <Text style={styles.modalSubtitle}>
              Your password has been successfully established and your account
              is active.{"\n\n"}
              Please log in using your registered phone number and your newly
              created password.
            </Text>

            <Pressable style={styles.modalButton} onPress={handleReturnToLogin}>
              <Text style={styles.modalButtonText}>Back to Sign In</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default CompleteProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topBar: {
    paddingTop: Platform.OS === "ios" ? 54 : 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginTop: 20,
    flexDirection: "row",
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#010101",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#555555",
    lineHeight: 20,
    marginBottom: 28,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 8,
  },
  errorBannerText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: Colors.gray,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "500",
  },
  passwordContainer: {
    height: 52,
    backgroundColor: "#D3D3D3",
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.black,
  },
  hintText: {
    fontSize: 11,
    color: Colors.gray,
    marginBottom: 28,
  },
  submitButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },

  // Guard Screen Styles
  guardContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  guardIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  guardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#010101",
    marginBottom: 10,
    textAlign: "center",
  },
  guardSubtitle: {
    fontSize: 13,
    color: "#555555",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  guardButton: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  guardButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  successIconCircle: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#010101",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#555555",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});
