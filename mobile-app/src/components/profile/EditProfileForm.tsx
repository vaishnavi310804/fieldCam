import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EditProfileField } from "./EditProfileField";

export interface EditProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  jobTitle: string;
  department: string;
  bio: string;
  linkedin: string;
  twitter: string;
  github: string;
  website: string;
}

export interface EditProfileFormProps {
  activeTab: "personal" | "work";
  onTabChange: (tab: "personal" | "work") => void;
  formData: EditProfileFormData;
  onFieldChange: (field: keyof EditProfileFormData, value: string) => void;
  avatarInitials: string;
  profileImage?: string | null;
  onSave: () => void;
  onCancel: () => void;
  validationErrors?: Record<string, string>;
  isSubmitting?: boolean;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  activeTab,
  onTabChange,
  formData,
  onFieldChange,
  avatarInitials,
  profileImage,
  onSave,
  onCancel,
  validationErrors = {},
  isSubmitting = false,
}) => {
  return (
    <View style={styles.formContainer}>
      {/* SECTION 1: PROFILE PHOTO CARD */}
      <View style={styles.photoCard}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitialsText}>{avatarInitials}</Text>
          </View>
        )}

        <View style={styles.photoMeta}>
          <Text style={styles.photoTitle}>Profile Details</Text>
        </View>
      </View>

      {/* SECTION 2: TAB SELECTOR */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tabButton, activeTab === "personal" && styles.tabButtonActive]}
          onPress={() => onTabChange("personal")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "personal" }}
          accessibilityLabel="Personal information tab"
        >
          <Text style={[styles.tabText, activeTab === "personal" && styles.tabTextActive]}>
            Personal
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabButton, activeTab === "work" && styles.tabButtonActive]}
          onPress={() => onTabChange("work")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "work" }}
          accessibilityLabel="Work and bio tab"
        >
          <Text style={[styles.tabText, activeTab === "work" && styles.tabTextActive]}>
            Work & Bio
          </Text>
        </Pressable>
      </View>

      {/* SECTION 3: TAB CONTENT */}
      {activeTab === "personal" ? (
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={18} color="#4B443F" />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>

          {/* First Name */}
          <EditProfileField
            label="First Name"
            value={formData.firstName}
            onChangeText={(text) => onFieldChange("firstName", text)}
            placeholder="First Name"
            icon="person-outline"
            required
            maxLength={50}
            autoCapitalize="words"
            errorText={validationErrors.firstName}
          />

          {/* Last Name */}
          <EditProfileField
            label="Last Name"
            value={formData.lastName}
            onChangeText={(text) => onFieldChange("lastName", text)}
            placeholder="Last Name"
            icon="person-outline"
            required
            maxLength={50}
            autoCapitalize="words"
            errorText={validationErrors.lastName}
          />

          {/* Email Address (Read-only) */}
          <EditProfileField
            label="Email Address"
            value={formData.email}
            placeholder="email@example.com"
            icon="mail-outline"
            readOnly
            keyboardType="email-address"
            autoCapitalize="none"
            helperText="Email address cannot be changed directly. Contact administrator."
          />

          {/* Phone Number */}
          <EditProfileField
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => onFieldChange("phone", text)}
            placeholder="Phone Number"
            icon="call-outline"
            keyboardType="phone-pad"
            autoCapitalize="none"
          />

          {/* Location */}
          <EditProfileField
            label="Location"
            value={formData.location}
            onChangeText={(text) => onFieldChange("location", text)}
            placeholder="City, Country"
            icon="location-outline"
            autoCapitalize="words"
          />
        </View>
      ) : (
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Ionicons name="briefcase-outline" size={18} color="#4B443F" />
            <Text style={styles.cardTitle}>Professional Details</Text>
          </View>

          {/* Job Title */}
          <EditProfileField
            label="Job Title"
            value={formData.jobTitle}
            onChangeText={(text) => onFieldChange("jobTitle", text)}
            placeholder="e.g. Operations Specialist"
            icon="briefcase-outline"
            autoCapitalize="words"
          />

          {/* Department */}
          <EditProfileField
            label="Department"
            value={formData.department}
            onChangeText={(text) => onFieldChange("department", text)}
            placeholder="e.g. Field Operations"
            icon="layers-outline"
            autoCapitalize="words"
          />

          {/* Bio */}
          <EditProfileField
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => onFieldChange("bio", text)}
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={4}
            maxLength={500}
            showCharCounter
            errorText={validationErrors.bio}
          />

          {/* Social Profiles Sub-section */}
          <View style={styles.subSectionDivider}>
            <View style={styles.subSectionHeader}>
              <Ionicons name="share-social-outline" size={16} color="#4B443F" />
              <Text style={styles.subSectionTitle}>Social Profiles</Text>
            </View>

            {/* LinkedIn */}
            <EditProfileField
              label="LinkedIn"
              value={formData.linkedin}
              onChangeText={(text) => onFieldChange("linkedin", text)}
              placeholder="https://linkedin.com/in/username"
              icon="logo-linkedin"
              keyboardType="url"
              autoCapitalize="none"
            />

            {/* Twitter / X */}
            <EditProfileField
              label="Twitter / X"
              value={formData.twitter}
              onChangeText={(text) => onFieldChange("twitter", text)}
              placeholder="https://twitter.com/username"
              icon="logo-twitter"
              keyboardType="url"
              autoCapitalize="none"
            />

            {/* GitHub */}
            <EditProfileField
              label="GitHub"
              value={formData.github}
              onChangeText={(text) => onFieldChange("github", text)}
              placeholder="https://github.com/username"
              icon="logo-github"
              keyboardType="url"
              autoCapitalize="none"
            />

            {/* Personal Website */}
            <EditProfileField
              label="Personal Website"
              value={formData.website}
              onChangeText={(text) => onFieldChange("website", text)}
              placeholder="https://example.com"
              icon="globe-outline"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>
      )}

      {/* SECTION 4: ACTIONS */}
      <View style={styles.actionContainer}>
        <Pressable
          style={[
            styles.saveButton,
            isSubmitting ? styles.saveButtonDisabled : null,
          ]}
          onPress={onSave}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Save Changes"
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[
            styles.cancelButton,
            isSubmitting ? styles.cancelButtonDisabled : null,
          ]}
          onPress={onCancel}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default EditProfileForm;

const styles = StyleSheet.create({
  formContainer: {
    gap: 16,
  },
  photoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#EAE4DF",
    borderWidth: 2,
    borderColor: "#FAF7F5",
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#C87A65",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FAF7F5",
  },
  avatarInitialsText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  photoMeta: {
    flex: 1,
    justifyContent: "center",
  },
  photoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C2724",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#EAE4DF",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#817B77",
  },
  tabTextActive: {
    color: "#2C2724",
    fontWeight: "700",
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3EFEA",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C2724",
  },
  subSectionDivider: {
    marginTop: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3EFEA",
  },
  subSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B443F",
  },
  actionContainer: {
    gap: 12,
    marginTop: 4,
    marginBottom: 20,
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
  cancelButtonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "600",
  },
});
