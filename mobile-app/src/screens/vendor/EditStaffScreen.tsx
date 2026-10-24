import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/src/constants/color";
import {
  dashboardApi,
  VendorStaffItem,
} from "@/src/api/dashboard.api";
import { PageHeader } from "@/src/components/navigation/PageHeader";

export const EditStaffScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [staff, setStaff] = useState<VendorStaffItem | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    if (!id) {
      setErrorMessage("Invalid staff member ID.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const staffList = await dashboardApi.getVendorStaffList();
      const found = staffList.find((item) => item._id === id);

      if (found) {
        setStaff(found);
        setName(found.name || "");
        setEmail(found.email || "");
        setPhone(found.phone || "");
      } else {
        setErrorMessage("Staff member not found or no longer active.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to load staff details.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleSave = async () => {
    if (isSubmitting || isLoading || !staff || !id) return;
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Please enter a valid staff name (at least 2 characters).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!trimmedPhone) {
      setErrorMessage("Please enter a contact phone number.");
      return;
    }

    try {
      setIsSubmitting(true);

      const updated = await dashboardApi.updateVendorStaff(id, {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
      });

      setStaff(updated);
      setName(updated.name || trimmedName);
      setEmail(updated.email || trimmedEmail);
      setPhone(updated.phone || trimmedPhone);

      Alert.alert(
        "Staff Details Updated",
        "Staff member details have been successfully saved.",
        [
          {
            text: "OK",
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace({
                  pathname: "/(app)/staff-details",
                  params: { id },
                } as any);
              }
            },
          },
        ]
      );
    } catch (err: any) {
      const apiError =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update staff member. Please check details and try again.";
      setErrorMessage(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rawStatus = (staff?.status || "ACTIVE").toLowerCase();
  const isActive = rawStatus === "active";
  const rawRole = staff?.role || "STAFF";
  const roleDisplay =
    rawRole.toUpperCase() === "STAFF" || rawRole.toUpperCase() === "VENDOR"
      ? "Field Worker / Staff"
      : rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

  return (
    <View style={styles.screenContainer}>
      <PageHeader title="Edit Staff Details" showBackButton={true} />

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading staff details...</Text>
        </View>
      ) : !staff && errorMessage ? (
        <View style={styles.contentPadding}>
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
            <Text style={styles.errorBoxTitle}>Staff Record Unavailable</Text>
            <Text style={styles.errorBoxText}>{errorMessage}</Text>
            <View style={styles.actionRow}>
              <Pressable style={styles.retryBtn} onPress={fetchStaff}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </Pressable>
              <Pressable style={styles.backBtn} onPress={() => router.back()}>
                <Text style={styles.backBtnText}>Go Back</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ERROR BANNER */}
            {errorMessage ? (
              <View style={styles.errorCard}>
                <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* SECTION 1: EDITABLE DETAILS */}
            <View style={styles.sectionCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-outline" size={18} color="#374151" />
                <Text style={styles.cardTitle}>Staff Information</Text>
              </View>

              {/* NAME FIELD */}
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
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* EMAIL FIELD */}
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
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* PHONE FIELD */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="call-outline" size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="+91"
                    placeholderTextColor="#9CA3AF"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    editable={!isSubmitting}
                  />
                </View>
              </View>
            </View>

            {/* SECTION 2: READ-ONLY ADMINISTRATIVE METADATA */}
            <View style={styles.sectionCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="shield-outline" size={18} color="#374151" />
                <Text style={styles.cardTitle}>Account & Organization</Text>
              </View>

              {/* ROLE (NON-EDITABLE) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Role</Text>
                <View style={[styles.inputBox, styles.readOnlyInputBox]}>
                  <Ionicons name="briefcase-outline" size={18} color="#9CA3AF" />
                  <Text style={styles.readOnlyText}>{roleDisplay}</Text>
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed-outline" size={12} color="#8C827A" />
                    <Text style={styles.lockedBadgeText}>Fixed</Text>
                  </View>
                </View>
              </View>

              {/* STATUS (NON-EDITABLE) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Account Status</Text>
                <View style={[styles.inputBox, styles.readOnlyInputBox]}>
                  <Ionicons
                    name={isActive ? "checkmark-circle-outline" : "pause-circle-outline"}
                    size={18}
                    color={isActive ? "#16A34A" : "#9CA3AF"}
                  />
                  <Text style={styles.readOnlyText}>{isActive ? "Active" : "Inactive"}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      isActive ? styles.statusPillActive : styles.statusPillInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isActive ? styles.statusPillTextActive : styles.statusPillTextInactive,
                      ]}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.infoCaption}>
                  Role, organization association, and status are administrative attributes.
                </Text>
              </View>
            </View>

            {/* ACTIONS */}
            <View style={styles.actionContainer}>
              <Pressable
                style={[
                  styles.saveButton,
                  (isSubmitting || isLoading) && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={isSubmitting || isLoading}
                accessibilityRole="button"
                accessibilityLabel="Save Changes"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={styles.cancelButton}
                onPress={() => router.back()}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

export default EditStaffScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingBottom: 80,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  contentPadding: {
    padding: 16,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray,
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
  readOnlyText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8E2DD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lockedBadgeText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillActive: {
    backgroundColor: "#DCFCE7",
  },
  statusPillInactive: {
    backgroundColor: "#F3F4F6",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusPillTextActive: {
    color: "#16A34A",
  },
  statusPillTextInactive: {
    color: "#6B7280",
  },
  infoCaption: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
    marginLeft: 2,
  },
  actionContainer: {
    marginTop: 8,
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#8C827A",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  errorBoxTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 10,
    marginBottom: 6,
  },
  errorBoxText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  backBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
});
