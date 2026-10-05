import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { authApi } from "@/src/api/auth.api";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import { AddStaffForm, AddStaffFormData } from "@/src/components/team/AddStaffForm";

export const AddStaffScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCreateStaff = async (formData: AddStaffFormData) => {
    try {
      setIsLoading(true);

      await authApi.createStaffUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      Alert.alert(
        "Staff Invited",
        `An onboarding invite with registration details has been sent to ${formData.email}.`,
        [
          {
            text: "OK",
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(app)/team" as any);
              }
            },
          },
        ]
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send staff invitation. Please check the details and try again.";
      Alert.alert("Invitation Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      {/* REUSABLE PAGE HEADER */}
      <PageHeader title="Add staff" showBackButton={true} />

      {/* FORM CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AddStaffForm onSubmit={handleCreateStaff} isLoading={isLoading} />
      </ScrollView>
    </View>
  );
};

export default AddStaffScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
});
