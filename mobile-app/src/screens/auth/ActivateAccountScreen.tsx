import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "@/src/constants/color";
import { verifyRegistrationOTP } from "@/src/api/auth.api";

const ActivateAccountScreen = () => {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState((params.email || "").toString());
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  };

  const handleOtpChange = (text: string, index: number) => {
    if (errorMessage) setErrorMessage(null);

    // Handle paste of full or partial code
    const cleanedText = text.replace(/[^0-9]/g, "");
    if (cleanedText.length >= 6) {
      const newOtp = cleanedText.slice(0, 6).split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanedText.slice(-1); // Take last entered digit
    setOtp(newOtp);

    // Auto-advance to next box if digit entered
    if (cleanedText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const isOtpComplete = otp.every((digit) => digit.trim() !== "");
  const otpString = otp.join("");

  const handleVerify = async () => {
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!isOtpComplete || otpString.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    if (!/^\d{6}$/.test(otpString)) {
      setErrorMessage("OTP must contain only numbers.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await verifyRegistrationOTP({
        email: trimmedEmail,
        otp: otpString,
      });

      if (!result.setupToken) {
        throw new Error("Missing setup token in response. Please try again.");
      }

      router.push({
        pathname: "/(auth)/complete-profile" as any,
        params: {
          setupToken: result.setupToken,
          email: result.user?.email || trimmedEmail,
          name: result.user?.name || "",
        },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        err?.message ||
        "Verification failed. Please check your details and try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Content Section */}
        <View style={styles.content}>
          <Text style={styles.title}>Activate Account</Text>
          <Text style={styles.subtitle}>
            Enter your registered email and the 6-digit verification code sent
            to your mail.
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="user@example.com"
              placeholderTextColor="#A1A1AA"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              style={styles.input}
            />
          </View>

          {/* OTP Section Label */}
          <View style={styles.otpLabelContainer}>
            <Text style={styles.label}>6-Digit Verification Code (OTP)</Text>
          </View>

          {/* 6 OTP Boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
                editable={!isSubmitting}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              />
            ))}
          </View>

          {/* Security Notice */}
          <View style={styles.noticeContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={Colors.primary}
            />
            <Text style={styles.noticeText}>
              The 6-digit OTP was dispatched to your email address when your
              vendor account was created.
            </Text>
          </View>

          {/* Verify Button */}
          <Pressable
            style={[
              styles.verifyButton,
              (!isOtpComplete || isSubmitting) && styles.disabledButton,
            ]}
            onPress={handleVerify}
            disabled={!isOtpComplete || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.verifyText}>Verify Code</Text>
            )}
          </Pressable>

          {/* Return to Login */}
          <View style={styles.backToLoginContainer}>
            <Pressable onPress={() => router.replace("/(auth)/login" as any)}>
              <Text style={styles.backToLoginText}>Back to Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ActivateAccountScreen;

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
    marginBottom: 24,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: Colors.gray,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    height: 52,
    backgroundColor: "#D3D3D3",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 13,
    color: Colors.black,
  },
  otpLabelContainer: {
    marginBottom: 2,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 6,
  },
  otpBox: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: "#FFFFFF",
  },
  noticeContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(146, 136, 128, 0.12)",
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 24,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: "#4A4A4A",
    lineHeight: 18,
  },
  verifyButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.65,
  },
  verifyText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  backToLoginContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  backToLoginText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
  },
});
