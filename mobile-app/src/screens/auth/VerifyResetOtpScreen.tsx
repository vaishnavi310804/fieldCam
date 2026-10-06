import React, { useEffect, useRef, useState } from "react";
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
import { forgotPassword, verifyResetOTP } from "@/src/api/auth.api";

const VerifyResetOtpScreen = () => {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = (params.email || "").toString();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // 30-second countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    if (errorMessage) setErrorMessage(null);
    if (successMessage) setSuccessMessage(null);

    // Handle Paste (e.g. pasting full 6 digits)
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

    // Auto-focus next box if digit entered
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
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage("Missing email parameter. Please go back and try again.");
      return;
    }

    if (!isOtpComplete || otpString.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await verifyResetOTP(email, otpString);

      if (!result.resetToken) {
        throw new Error("Failed to obtain reset token. Please try again.");
      }

      // Navigate to Reset Password Screen with resetToken
      router.push({
        pathname: "/(auth)/reset-password" as any,
        params: {
          email,
          resetToken: result.resetToken,
        },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid verification code. Please check and try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending || !email) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setIsResending(true);
      await forgotPassword(email);
      setTimer(30);
      setSuccessMessage("A new verification code has been sent.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend verification code. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsResending(false);
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
        {/* Top Back Navigation */}
        <View style={styles.topBar}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={10}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#333333" />
          </Pressable>
        </View>

        {/* Form Body */}
        <View style={styles.content}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{"\n"}
            <Text style={styles.emailText}>{email || "your email address"}</Text>
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successBanner}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#16A34A"
              />
              <Text style={styles.successBannerText}>{successMessage}</Text>
            </View>
          ) : null}

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
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                ]}
              />
            ))}
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
              <Text style={styles.verifyText}>Verify</Text>
            )}
          </Pressable>

          {/* Resend Section */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              {"Didn't receive code? "}
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              ) : (
                <Text
                  style={styles.resendActiveText}
                  onPress={handleResend}
                >
                  {isResending ? "Sending..." : "Resend"}
                </Text>
              )}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VerifyResetOtpScreen;

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
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 28,
  },
  emailText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
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
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  successBannerText: {
    color: "#15803D",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
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
  verifyButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.65,
  },
  verifyText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  resendContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  resendText: {
    fontSize: 13,
    color: "#64748B",
  },
  timerText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  resendActiveText: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
