import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/src/constants/color";
import { useAuth } from "@/src/context/AuthContext";

const LoginScreen = () => {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    setErrorMessage(null);

    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (!trimmedPhone) {
      setErrorMessage("Please enter your phone number.");
      return;
    }

    if (!trimmedPassword) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login({
        phone: trimmedPhone,
        password: trimmedPassword,
      });
      router.replace("/(app)/" as any);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to sign in. Please check your credentials.";
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
        <LinearGradient
          colors={[Colors.peach, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="camera-outline" size={28} color={Colors.white} />
          </View>

          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back</Text>

            <Text style={styles.subtitle}>
              Sign in to your vendor account
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>

            <TextInput
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="+91 Enter phone number"
              placeholderTextColor="#A1A1AA"
              keyboardType="phone-pad"
              autoCapitalize="none"
              editable={!isSubmitting}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>

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

          <Pressable
            style={styles.forgotPasswordContainer}
            onPress={() => {}}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </Pressable>

          <Pressable
            style={[styles.signInButton, isSubmitting && styles.disabledButton]}
            onPress={handleSignIn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.signInText}>Sign In</Text>
            )}
          </Pressable>

          <View style={styles.orContainer}>
            <Text style={styles.orText}>or</Text>
          </View>

          {/* SSO */}
          <Pressable style={styles.ssoButton} onPress={() => {}}>
            <Text style={styles.ssoText}>Sign in with SSO</Text>
          </Pressable>

          {/* Contact Admin */}
          <View style={styles.contactContainer}>
            <Text style={styles.contactText}>
              {"Don't have an account? "}
            </Text>

            <Pressable onPress={() => {}}>
              <Text style={styles.contactLink}>Contact Admin</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    height: 245,
    paddingHorizontal: 20,
    paddingTop: 80,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  welcomeContainer: {
    marginTop: 20,
  },

  welcomeText: {
    color: Colors.white,
    fontSize: 21,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 4,
    color: Colors.white,
    fontSize: 13,
    opacity: 0.85,
  },

  formContainer: {
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 30,
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
    marginBottom: 10,
  },

  label: {
    color: Colors.gray,
    fontSize: 12,
    marginBottom: 6,
  },

  input: {
    height: 52,
    backgroundColor: "#D3D3D3",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 13,
    color: Colors.black,
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

  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: 1,
    marginBottom: 26,
  },

  forgotPassword: {
    color: "#0066FF",
    fontSize: 12,
  },

  signInButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.7,
  },

  signInText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },

  orContainer: {
    alignItems: "center",
    marginVertical: 24,
  },

  orText: {
    color: "#A1A1AA",
    fontSize: 14,
  },

  ssoButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  ssoText: {
    color: "#333333",
    fontSize: 13,
    fontWeight: "500",
  },

  contactContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },

  contactText: {
    color: "#A1A1AA",
    fontSize: 11,
  },

  contactLink: {
    color: "#0066FF",
    fontSize: 12,
    fontWeight: "500",
  },
});