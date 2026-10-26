import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { authApi, UpdateProfilePayload } from "@/src/api/auth.api";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import {
  EditProfileForm,
  EditProfileFormData,
} from "@/src/components/profile/EditProfileForm";

export const EditProfileScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ location?: string }>();
  const { user, checkAuth } = useAuth();

  const [activeTab, setActiveTab] = useState<"personal" | "work">("personal");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<EditProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    jobTitle: "",
    department: "",
    bio: "",
    linkedin: "",
    twitter: "",
    github: "",
    website: "",
  });

  // Prefill form from authenticated user and optional navigation params
  useEffect(() => {
    let initFirst = user?.firstName || "";
    let initLast = user?.lastName || "";

    if (!initFirst && !initLast && user?.name) {
      const parts = user.name.trim().split(/\s+/);
      initFirst = parts[0] || "";
      initLast = parts.slice(1).join(" ") || "";
    }

    const initPhone = user?.phone || "";
    const initLocation = user?.location || (params.location as string) || "";
    const initTitle = user?.title || (user as any)?.jobTitle || "";
    const initDepartment = user?.department || "";
    const initBio = (user as any)?.bio || "";
    const social = (user as any)?.socialLinks || {};

    setFormData({
      firstName: initFirst,
      lastName: initLast,
      email: user?.email || "",
      phone: initPhone,
      location: initLocation,
      jobTitle: initTitle,
      department: initDepartment,
      bio: initBio,
      linkedin: social.linkedin || "",
      twitter: social.twitter || "",
      github: social.github || "",
      website: social.website || "",
    });
  }, [user, params.location]);

  const handleFieldChange = (field: keyof EditProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user types in that field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBack = () => {
    if (isSubmitting) return;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile" as any);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    handleBack();
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    const errors: Record<string, string> = {};

    const trimmedFirst = formData.firstName.trim();
    const trimmedLast = formData.lastName.trim();

    if (!trimmedFirst) {
      errors.firstName = "First Name is required.";
    } else if (trimmedFirst.length < 2 || trimmedFirst.length > 50) {
      errors.firstName = "First Name must be between 2 and 50 characters.";
    }

    if (!trimmedLast) {
      errors.lastName = "Last Name is required.";
    } else if (trimmedLast.length < 2 || trimmedLast.length > 50) {
      errors.lastName = "Last Name must be between 2 and 50 characters.";
    }

    if (formData.bio.length > 500) {
      errors.bio = "Bio cannot exceed 500 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);

      // If personal fields have errors, automatically switch to personal tab
      if (errors.firstName || errors.lastName) {
        setActiveTab("personal");
      } else if (errors.bio) {
        setActiveTab("work");
      }

      Alert.alert(
        "Validation Error",
        "Please resolve the highlighted field errors before saving."
      );
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);

    const payload: UpdateProfilePayload = {
      firstName: trimmedFirst,
      lastName: trimmedLast,
      phone: formData.phone.trim(),
      location: formData.location.trim(),
      title: formData.jobTitle.trim(),
      department: formData.department.trim(),
      bio: formData.bio.trim(),
      socialLinks: {
        linkedin: formData.linkedin.trim(),
        twitter: formData.twitter.trim(),
        github: formData.github.trim(),
        website: formData.website.trim(),
      },
    };

    try {
      await authApi.updateProfile(payload);
      await checkAuth();

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/profile" as any);
      }
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile. Please try again.";
      Alert.alert("Error", apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derive initials from user name or local form first/last name
  const avatarInitials =
    user?.name?.slice(0, 2).toUpperCase() ||
    (formData.firstName
      ? (formData.firstName[0] + (formData.lastName[0] || "")).toUpperCase()
      : "VD");

  return (
    <View style={styles.screenContainer}>
      <PageHeader
        title="Edit Profile"
        showBackButton={true}
        onBackPress={isSubmitting ? undefined : handleBack}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <EditProfileForm
            activeTab={activeTab}
            onTabChange={setActiveTab}
            formData={formData}
            onFieldChange={handleFieldChange}
            avatarInitials={avatarInitials}
            profileImage={user?.profileImage}
            onSave={handleSave}
            onCancel={handleCancel}
            validationErrors={validationErrors}
            isSubmitting={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#EEE9E6",
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
});
