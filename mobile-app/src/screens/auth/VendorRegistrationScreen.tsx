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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/src/constants/color";
import { submitVendorRegistration } from "@/src/api/vendorRegistration.api";

const PRESET_SERVICES = [
  "Site Inspection",
  "Maintenance",
  "Annual Inspection",
  "Interior Inspection",
];

const VendorRegistrationScreen = () => {
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [servicesInput, setServicesInput] = useState("Site Inspection");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const togglePresetService = (service: string) => {
    if (errorMessage) setErrorMessage(null);
    const current = servicesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (current.includes(service)) {
      setServicesInput(current.filter((s) => s !== service).join(", "));
    } else {
      setServicesInput([...current, service].join(", "));
    }
  };

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    const trimmedContact = contactName.trim();
    const trimmedCompany = companyName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedLocation = location.trim();
    const trimmedDescription = description.trim();

    if (!trimmedContact) {
      setErrorMessage("Please enter the contact person's full name.");
      return;
    }

    if (trimmedContact.length < 2) {
      setErrorMessage("Contact name must be at least 2 characters.");
      return;
    }

    if (!trimmedCompany) {
      setErrorMessage("Please enter your company or business name.");
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage("Please enter your business email address.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!trimmedPhone) {
      setErrorMessage("Please enter your contact phone number.");
      return;
    }

    const cleanDigits = trimmedPhone.replace(/[\s\-\(\)\.]/g, "");
    if (cleanDigits.length < 7) {
      setErrorMessage("Phone number must contain at least 7 digits.");
      return;
    }

    if (!trimmedLocation) {
      setErrorMessage("Please enter your business operating address or city.");
      return;
    }

    const servicesList = servicesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (servicesList.length === 0) {
      setErrorMessage("Please specify at least one service offered.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitVendorRegistration({
        contactName: trimmedContact,
        companyName: trimmedCompany,
        email: trimmedEmail,
        phone: trimmedPhone,
        location: trimmedLocation,
        services: servicesList,
        description: trimmedDescription || undefined,
      });

      setIsSubmitted(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        err?.response?.data?.errors?.[0]?.message ||
        err?.message ||
        "Failed to submit registration request. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.successContent} showsVerticalScrollIndicator={false}>
          <View style={styles.successCard}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={54} color="#16A34A" />
            </View>

            <Text style={styles.successTitle}>Request Received!</Text>

            <Text style={styles.successDescription}>
              Your vendor registration request for <Text style={styles.boldText}>{companyName.trim()}</Text> has been
              successfully submitted and is pending administrative review.
            </Text>

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Contact:</Text>
                <Text style={styles.summaryValue}>{contactName.trim()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Email:</Text>
                <Text style={styles.summaryValue}>{email.trim().toLowerCase()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Location:</Text>
                <Text style={styles.summaryValue}>{location.trim()}</Text>
              </View>
            </View>

            <View style={styles.infoNotice}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
              <Text style={styles.infoNoticeText}>
                Upon approval of your account an invitation email
                with your registration OTP will be sent to your registered email.
              </Text>
            </View>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.replace("/(auth)/login" as any)}
            >
              <Text style={styles.primaryButtonText}>Return to Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
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
            disabled={isSubmitting}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#333333" />
          </Pressable>
          <Text style={styles.topBarTitle}>Vendor Registration</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <Text style={styles.title}>Request Account Access</Text>
          <Text style={styles.subtitle}>
            To aasociate with FieldCam submit your company details and contact information.
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Contact Person Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {"Contact Name "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              value={contactName}
              onChangeText={(text) => {
                setContactName(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter your Name"
              placeholderTextColor="#A1A1AA"
              autoCapitalize="words"
              editable={!isSubmitting}
              style={styles.input}
            />
          </View>

          {/* Company Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Company / Business Name <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              value={companyName}
              onChangeText={(text) => {
                setCompanyName(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Company Name..."
              placeholderTextColor="#A1A1AA"
              autoCapitalize="words"
              editable={!isSubmitting}
              style={styles.input}
            />
          </View>

          {/* Business Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Business Email <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter your business email"
              placeholderTextColor="#A1A1AA"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              style={styles.input}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="+91"
              placeholderTextColor="#A1A1AA"
              keyboardType="phone-pad"
              autoCapitalize="none"
              editable={!isSubmitting}
              style={styles.input}
            />
          </View>

          {/* Business Address or Operating Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Address / Location <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Address..."
              placeholderTextColor="#A1A1AA"
              autoCapitalize="words"
              editable={!isSubmitting}
              style={styles.input}
            />
          </View>

          {/* Services Offered */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Services Offered <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              value={servicesInput}
              onChangeText={(text) => {
                setServicesInput(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Site Inspection, ...."
              placeholderTextColor="#A1A1AA"
              editable={!isSubmitting}
              style={styles.input}
            />

            {/* Service preset pills */}
            <View style={styles.presetsContainer}>
              {PRESET_SERVICES.map((preset) => {
                const isSelected = servicesInput
                  .split(",")
                  .map((s) => s.trim())
                  .includes(preset);
                return (
                  <Pressable
                    key={preset}
                    onPress={() => togglePresetService(preset)}
                    style={[styles.presetPill, isSelected && styles.presetPillActive]}
                  >
                    <Text style={[styles.presetPillText, isSelected && styles.presetPillTextActive]}>
                      {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Company Description (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Company Description <Text style={styles.optionalText}>(Optional)</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={(text) => setDescription(text)}
              placeholder="Brief details about your operations, equipment, or team size..."
              placeholderTextColor="#A1A1AA"
              multiline
              numberOfLines={3}
              editable={!isSubmitting}
              style={[styles.input, styles.textArea]}
            />
          </View>

          {/* Security & Process Note */}
          <View style={styles.noticeContainer}>
            <Ionicons name="shield-outline" size={16} color={Colors.primary} />
            <Text style={styles.noticeText}>
              Applications are reviewed by FieldCam Admin.
            </Text>
          </View>

          {/* Submit Button */}
          <Pressable
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Submit Registration Request</Text>
            )}
          </Pressable>

          {/* Back to Login link */}
          <View style={styles.footerLinkContainer}>
            <Text style={styles.footerText}>Already registered? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.linkText}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VendorRegistrationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  topBar: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },

  topBarTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#27272A",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#18181B",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color: "#71717A",
    lineHeight: 18,
    marginBottom: 20,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
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
    marginBottom: 14,
  },

  label: {
    color: "#3F3F46",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },

  requiredStar: {
    color: "#EF4444",
  },

  optionalText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "normal",
  },

  input: {
    height: 48,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    paddingHorizontal: 14,
    fontSize: 13,
    color: "#18181B",
  },

  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: "top",
  },

  presetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },

  presetPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#F4F4F5",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },

  presetPillActive: {
    backgroundColor: "#EEF0FF",
    borderColor: Colors.primary,
  },

  presetPillText: {
    fontSize: 11,
    color: "#71717A",
    fontWeight: "500",
  },

  presetPillTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },

  noticeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    marginVertical: 10,
  },

  noticeText: {
    flex: 1,
    fontSize: 11,
    color: Colors.white,
    lineHeight: 15,
  },

  primaryButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingHorizontal: 16,
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },

  footerLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  footerText: {
    color: "#71717A",
    fontSize: 12,
  },

  linkText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },

  /* Success Screen Styles */
  successContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },

  successCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  successIconContainer: {
    marginBottom: 16,
  },

  successTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#18181B",
    marginBottom: 8,
  },

  successDescription: {
    fontSize: 13,
    color: "#71717A",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
  },

  boldText: {
    fontWeight: "700",
    color: "#18181B",
  },

  summaryBox: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 16,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  summaryValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  infoNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF0FF",
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 20,
  },

  infoNoticeText: {
    flex: 1,
    fontSize: 11,
    color: "#4338CA",
    lineHeight: 16,
  },
});
