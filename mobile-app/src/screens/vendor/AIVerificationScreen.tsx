import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "@/src/constants/color";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import {
  getProjectById,
  submitVendorProject,
  VendorProjectItem,
  VendorProjectPhoto,
} from "@/src/api/dashboard.api";
import { VerificationPhotoCard } from "@/src/components/verification/VerificationPhotoCard";
import { VerificationSummary } from "@/src/components/verification/VerificationSummary";
import { VerificationChecks } from "@/src/components/verification/VerificationChecks";
import { SubmitPhotoButton } from "@/src/components/verification/SubmitPhotoButton";

export function AIVerificationScreen() {
  const params = useLocalSearchParams<{
    projectId?: string;
    photoId?: string;
    photoUri?: string;
    checklistItemId?: string;
  }>();

  const projectId = params.projectId;
  const photoId = params.photoId;
  const photoUri = params.photoUri;
  const checklistItemId = params.checklistItemId;

  const [project, setProject] = useState<VendorProjectItem | null>(null);
  const [targetPhoto, setTargetPhoto] = useState<VendorProjectPhoto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectDetails = useCallback(
    async (showLoading = true) => {
      if (!projectId) {
        setError("No project ID specified for AI Verification.");
        setIsLoading(false);
        return;
      }

      try {
        if (showLoading) setIsLoading(true);
        setError(null);

        const fetchedProject = await getProjectById(projectId);
        setProject(fetchedProject);

        // Find target photo
        const photos = fetchedProject.photos || [];
        let matchedPhoto: VendorProjectPhoto | undefined = undefined;

        if (photoId) {
          matchedPhoto = photos.find((p) => String(p._id) === String(photoId));
        }
        if (!matchedPhoto && checklistItemId) {
          matchedPhoto = photos.find(
            (p) => String(p.checklistItemId) === String(checklistItemId)
          );
        }
        if (!matchedPhoto && photos.length > 0) {
          matchedPhoto = photos[photos.length - 1];
        }

        if (matchedPhoto) {
          setTargetPhoto(matchedPhoto);
        } else if (photoUri) {
          // Construct fallback photo object from local params if photo array is empty
          setTargetPhoto({
            url: photoUri,
            checklistItemId: checklistItemId || "",
            capturedAt: new Date().toISOString(),
            aiValidation: {
              status: "PASSED",
            },
          });
        }
      } catch (err: any) {
        console.error("Failed to load project for AI Verification:", err);
        setError(err?.message || "Failed to load verification data.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [projectId, photoId, checklistItemId, photoUri]
  );

  useEffect(() => {
    fetchProjectDetails(true);
  }, [fetchProjectDetails]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProjectDetails(false);
  }, [fetchProjectDetails]);

  const handleSubmitPhoto = async () => {
    if (!projectId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const updatedProject = await submitVendorProject(projectId);
      
      Alert.alert(
        "Submission Successful",
        `Project "${updatedProject.projectName || projectId}" has been submitted for client review.`,
        [
          {
            text: "OK",
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(app)/projects");
              }
            },
          },
        ]
      );
    } catch (err: any) {
      console.error("Project submission error:", err);
      Alert.alert(
        "Submission Error",
        err?.message || "Failed to submit project. Please verify all requirements and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStatus = targetPhoto?.aiValidation?.status || "PASSED";
  const displayImageUri = targetPhoto?.url || photoUri;
  const categoryItem = project?.checklistItems?.find(
    (item) => String(item.id) === String(checklistItemId || targetPhoto?.checklistItemId)
  );

  return (
    <View style={styles.screenContainer}>
      <PageHeader
        title="AI Verification"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading verification details...</Text>
        </View>
      ) : error || !project ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={44} color="#DC2626" />
          <Text style={styles.errorText}>{error || "Verification data unavailable"}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {/* Photo Preview Card with Status Badge */}
          <VerificationPhotoCard
            imageUri={displayImageUri}
            status={currentStatus}
            categoryLabel={categoryItem?.label || targetPhoto?.category}
          />

          {/* Verification Summary Card */}
          <VerificationSummary
            status={currentStatus}
            reason={targetPhoto?.aiValidation?.reason || targetPhoto?.aiValidation?.subject?.reason}
            categoryLabel={categoryItem?.label || targetPhoto?.category}
          />

          {/* Detailed Verification Checks */}
          <VerificationChecks photo={targetPhoto || undefined} project={project} />

          {/* Primary Action Submit Button */}
          <SubmitPhotoButton
            onPress={handleSubmitPhoto}
            isLoading={isSubmitting}
            status={currentStatus}
          />
        </ScrollView>
      )}
    </View>
  );
}

export default AIVerificationScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingBottom:100
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#817B77",
  },
  errorText: {
    marginVertical: 12,
    fontSize: 14,
    color: "#991B1B",
    textAlign: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
});
