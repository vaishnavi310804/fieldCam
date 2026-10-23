import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import Colors from "@/src/constants/color";
import { authApi, FieldCamUser } from "@/src/api/auth.api";
import { dashboardApi, VendorProfileData } from "@/src/api/dashboard.api";
import { useAuth } from "@/src/context/AuthContext";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: VendorProfileData | null;
  onSuccess: (updatedProfile?: VendorProfileData) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  profile,
  onSuccess,
}) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"personal" | "work">("personal");

  // Form Fields
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [bio, setBio] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prefill form from latest user and vendor profile when modal opens
  useEffect(() => {
    if (visible) {
      setErrorMessage(null);
      setIsSubmitting(false);
      setActiveTab("personal");

      // 1. First & Last Name
      let initFirst = user?.firstName || profile?.userId?.firstName || "";
      let initLast = user?.lastName || profile?.userId?.lastName || "";

      if (!initFirst && !initLast) {
        const candidate = user?.name || profile?.userId?.name || profile?.contactName || "";
        if (candidate) {
          const parts = candidate.trim().split(/\s+/);
          initFirst = parts[0] || "";
          initLast = parts.slice(1).join(" ") || "";
        }
      }
      setFirstName(initFirst);
      setLastName(initLast);

      // 2. Phone
      setPhone(user?.phone || profile?.userId?.phone || "");

      // 3. City & Country
      const existingCity = user?.city || profile?.city || "";
      const existingCountry = user?.country || profile?.country || "";
      if (existingCity || existingCountry) {
        setCity(existingCity);
        setCountry(existingCountry);
      } else {
        const rawLoc = user?.location || profile?.location || profile?.userId?.location || "";
        if (rawLoc) {
          const [c = "", co = ""] = rawLoc.split(",").map((s) => s.trim());
          setCity(c);
          setCountry(co);
        } else {
          setCity("");
          setCountry("");
        }
      }

      // 4. Work & Bio
      setTitle(user?.title || profile?.userId?.title || "");
      setDepartment(user?.department || profile?.userId?.department || "");
      setBio(user?.bio || profile?.userId?.bio || "");
    }
  }, [visible, user, profile]);

  const emailDisplay = user?.email || profile?.userId?.email || "Not specified";

  const handleSave = async () => {
    if (isSubmitting) return;
    setErrorMessage(null);

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedPhone = phone.trim();
    const trimmedCity = city.trim();
    const trimmedCountry = country.trim();
    const trimmedTitle = title.trim();
    const trimmedDepartment = department.trim();
    const trimmedBio = bio.trim();

    // Client-side validations
    if (!trimmedFirstName) {
      setErrorMessage("First Name is required.");
      return;
    }
    if (trimmedFirstName.length < 2 || trimmedFirstName.length > 50) {
      setErrorMessage("First Name must be between 2 and 50 characters.");
      return;
    }

    if (!trimmedLastName) {
      setErrorMessage("Last Name is required.");
      return;
    }
    if (trimmedLastName.length < 2 || trimmedLastName.length > 50) {
      setErrorMessage("Last Name must be between 2 and 50 characters.");
      return;
    }

    if (trimmedBio.length > 500) {
      setErrorMessage("Bio cannot exceed 500 characters.");
      return;
    }

    try {
      setIsSubmitting(true);

      const locationString = [trimmedCity, trimmedCountry].filter(Boolean).join(", ");
      const updatePayload = {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        phone: trimmedPhone,
        city: trimmedCity,
        country: trimmedCountry,
        location: locationString,
        title: trimmedTitle,
        department: trimmedDepartment,
        bio: trimmedBio,
      };

      // 1. Authoritative update on auth-service
      const updatedUser: FieldCamUser = await authApi.updateProfile(updatePayload);

      // 2. Secondary update on platform-service for guaranteed immediate sync
      let updatedVendorProfile: VendorProfileData | undefined;
      try {
        updatedVendorProfile = await dashboardApi.updateVendorProfile(updatePayload);
      } catch (platformErr) {
        // Fallback: fetch latest vendor profile
        try {
          updatedVendorProfile = await dashboardApi.getVendorProfile();
        } catch {
          // Non-blocking
        }
      }

      // 3. Update local auth state
      updateUser(updatedUser);

      // 4. Notify parent screen
      onSuccess(updatedVendorProfile);
      onClose();

      Alert.alert("Success", "Profile updated successfully.");
    } catch (err: any) {
      console.error("Edit profile error on mobile:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to update profile. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={24} color="#1F2937" />
          </Pressable>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <Text style={styles.headerSubtitle}>Update your personal information</Text>
          </View>
          <Pressable
            style={[styles.saveHeaderButton, isSubmitting && styles.saveHeaderButtonDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Save Changes"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveHeaderButtonText}>Save</Text>
            )}
          </Pressable>
        </View>

        {/* TABS */}
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tabItem, activeTab === "personal" && styles.tabItemActive]}
            onPress={() => setActiveTab("personal")}
          >
            <Ionicons
              name="person-outline"
              size={16}
              color={activeTab === "personal" ? "#3E3734" : "#9CA3AF"}
            />
            <Text
              style={[
                styles.tabItemText,
                activeTab === "personal" && styles.tabItemTextActive,
              ]}
            >
              Personal
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabItem, activeTab === "work" && styles.tabItemActive]}
            onPress={() => setActiveTab("work")}
          >
            <Ionicons
              name="briefcase-outline"
              size={16}
              color={activeTab === "work" ? "#3E3734" : "#9CA3AF"}
            />
            <Text
              style={[
                styles.tabItemText,
                activeTab === "work" && styles.tabItemTextActive,
              ]}
            >
              Work & Bio
            </Text>
          </Pressable>
        </View>

        {/* SCROLLABLE FORM */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ERROR BANNER */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {activeTab === "personal" ? (
            <View style={styles.sectionCard}>
              {/* FIRST NAME */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  First Name <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View style={styles.inputBox}>
                  <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter first name"
                    placeholderTextColor="#9CA3AF"
                    value={firstName}
                    onChangeText={setFirstName}
                    maxLength={50}
                    autoCapitalize="words"
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* LAST NAME */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Last Name <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View style={styles.inputBox}>
                  <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter last name"
                    placeholderTextColor="#9CA3AF"
                    value={lastName}
                    onChangeText={setLastName}
                    maxLength={50}
                    autoCapitalize="words"
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* EMAIL ADDRESS (READ-ONLY) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <View style={[styles.inputBox, styles.readOnlyInputBox]}>
                  <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
                  <Text style={styles.readOnlyText} numberOfLines={1}>
                    {emailDisplay}
                  </Text>
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={12} color="#8C827A" />
                  </View>
                </View>
                <Text style={styles.captionText}>
                  Email address cannot be changed directly. Contact administrator.
                </Text>
              </View>

              {/* PHONE NUMBER */}
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
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* CITY */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>City</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="location-outline" size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Austin"
                    placeholderTextColor="#9CA3AF"
                    value={city}
                    onChangeText={setCity}
                    autoCapitalize="words"
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* COUNTRY */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Country</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="globe-outline" size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. USA"
                    placeholderTextColor="#9CA3AF"
                    value={country}
                    onChangeText={setCountry}
                    autoCapitalize="words"
                    editable={!isSubmitting}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.sectionCard}>
              {/* JOB TITLE */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Job Title</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="briefcase-outline" size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Operations Specialist"
                    placeholderTextColor="#9CA3AF"
                    value={title}
                    onChangeText={setTitle}
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* DEPARTMENT */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Department</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="layers-outline" size={18} color="#9CA3AF" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Field Operations"
                    placeholderTextColor="#9CA3AF"
                    value={department}
                    onChangeText={setDepartment}
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* BIO */}
              <View style={styles.fieldGroup}>
                <View style={styles.bioLabelRow}>
                  <Text style={styles.fieldLabel}>Bio</Text>
                  <Text
                    style={[
                      styles.bioCharCount,
                      bio.length > 500 && styles.bioCharCountError,
                    ]}
                  >
                    {bio.length}/500
                  </Text>
                </View>
                <View style={[styles.inputBox, styles.bioInputBox]}>
                  <TextInput
                    style={styles.bioTextInput}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor="#9CA3AF"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    editable={!isSubmitting}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>
          )}

          {/* SAVE BUTTON AT BOTTOM */}
          <View style={styles.footerActionBox}>
            <Pressable
              style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Save Changes"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditProfileModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F6F4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 52 : 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EAE4DF",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2EBE5",
  },
  headerTitleBox: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  saveHeaderButton: {
    backgroundColor: "#6B5E54",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveHeaderButtonDisabled: {
    opacity: 0.6,
  },
  saveHeaderButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE4DF",
    gap: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F3ECE7",
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: "#E2D7CF",
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  tabItemTextActive: {
    color: "#3E3734",
    fontWeight: "700",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#B91C1C",
    fontWeight: "500",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAE4DF",
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  requiredAsterisk: {
    color: "#DC2626",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    backgroundColor: "#FAF9F8",
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
  },
  readOnlyInputBox: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  readOnlyText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
  },
  lockedBadge: {
    padding: 4,
  },
  captionText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  bioLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bioCharCount: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  bioCharCountError: {
    color: "#DC2626",
    fontWeight: "700",
  },
  bioInputBox: {
    height: 110,
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  bioTextInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    width: "100%",
  },
  footerActionBox: {
    marginTop: 20,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6B5E54",
    borderRadius: 14,
    height: 50,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
