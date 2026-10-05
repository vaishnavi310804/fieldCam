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
import { isAxiosError } from "axios";
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

import { AIFailureModal } from "@/src/components/verification/AIFailureModal";
import { SubmissionConfirmModal } from "@/src/components/submission/SubmissionConfirmModal";
import { WorkSubmittedModal } from "@/src/components/submission/WorkSubmittedModal";

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
  const [showFailureModal, setShowFailureModal] = useState<boolean>(false);

  // Submission Flow Modals State
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [submittedProjectResult, setSubmittedProjectResult] =
    useState<VendorProjectItem | null>(null);

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
          if (matchedPhoto.aiValidation?.status === "FAILED") {
            setShowFailureModal(true);
          }
        } else if (photoUri) {
          // Construct fallback photo object from local params if photo array is empty
          setTargetPhoto({
            url: photoUri,
            checklistItemId: checklistItemId || "",
            capturedAt: new Date().toISOString(),
            aiValidation: {
              status: "PENDING",
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

  // Step 1: User taps "Submit Photo" -> Open Confirmation Modal
  const handleOpenSubmissionConfirm = () => {
    if (!projectId || isSubmitting) return;
    setShowConfirmModal(true);
  };

  // Step 2: User taps "Verify" inside Confirmation Modal -> Call real backend submit API
  const handleConfirmBackendSubmit = async () => {
    if (!projectId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const updatedProject = await submitVendorProject(projectId);

      // On successful submission from backend:
      setProject(updatedProject);
      setSubmittedProjectResult(updatedProject);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err: unknown) {
      console.error("Project submission error:", err);

      let alertTitle = "Submission Error";
      let alertMessage = "Unable to submit the project. Please try again.";

      if (isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data as {
          success?: boolean;
          message?: string;
          error?: string;
          errors?: {
            checklistItemId?: string;
            category?: string;
            photoId?: string;
            reason?: string;
          }[];
        };

        const mainMessage = responseData.message || responseData.error || "";
        const errorsList = responseData.errors;

        if (Array.isArray(errorsList) && errorsList.length > 0) {
          const formattedReasons = errorsList
            .map((item) => {
              const cat = item.category ? `• ${item.category}:\n  ` : "• ";
              const rsn = item.reason || "Validation failed";
              return `${cat}${rsn}`;
            })
            .join("\n\n");

          alertMessage = mainMessage
            ? `${mainMessage}\n\n${formattedReasons}`
            : formattedReasons;
        } else if (mainMessage) {
          alertMessage = mainMessage;
        }
      } else if (err instanceof Error && err.message) {
        if (!err.message.includes("Request failed with status code")) {
          alertMessage = err.message;
        }
      }

      Alert.alert(alertTitle, alertMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStatus: "PASSED" | "FAILED" | "PENDING" =
    targetPhoto?.aiValidation?.status || "PENDING";
  const displayImageUri = targetPhoto?.url || photoUri;
  const categoryItem = project?.checklistItems?.find(
    (item) =>
      String(item.id) === String(checklistItemId || targetPhoto?.checklistItemId)
  );

  // Compute actual submission summary state for Confirmation Modal
  const uploadedPhotosList = project?.photos || [];
  const photosCount = uploadedPhotosList.length;

  const getAiVerifiedStatusSummary = (): "All Passed" | "Pending" | "Failed" => {
    if (photosCount === 0) return "Pending";
    const hasFailed = uploadedPhotosList.some(
      (p) => p.aiValidation?.status === "FAILED"
    );
    if (hasFailed) return "Failed";

    const allPassed = uploadedPhotosList.every(
      (p) => p.aiValidation?.status === "PASSED"
    );
    return allPassed ? "All Passed" : "Pending";
  };

  const getLocationStatusSummary = (): "GPS Verified" | "Unverified" => {
    const hasGps = uploadedPhotosList.some(
      (p) =>
        p.location &&
        typeof p.location.latitude === "number" &&
        typeof p.location.longitude === "number"
    );
    return hasGps ? "GPS Verified" : "Unverified";
  };

  const getNotesStatusSummary = (): "Added" | "None" => {
    return project?.notes && project.notes.length > 0 ? "Added" : "None";
  };

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
            onPress={handleOpenSubmissionConfirm}
            isLoading={isSubmitting}
            status={currentStatus}
          />
        </ScrollView>
      )}

      {/* AI Failure Modal */}
      <AIFailureModal
        visible={showFailureModal}
        imageUri={displayImageUri}
        categoryLabel={categoryItem?.label || targetPhoto?.category}
        reason={
          targetPhoto?.aiValidation?.reason ||
          targetPhoto?.aiValidation?.subject?.reason
        }
        failDetailText={
          targetPhoto?.aiValidation?.subject?.reason
            ? `CHECK FAILED: ${targetPhoto.aiValidation.subject.reason.toUpperCase()}`
            : "CHECK FAILED: QUALITY ISSUE"
        }
        onRetakePhoto={() => {
          setShowFailureModal(false);
          router.push({
            pathname: "/(app)/capture",
            params: {
              id: projectId,
              checklistItemId: categoryItem?.id || targetPhoto?.checklistItemId,
            },
          });
        }}
        onProceedAnyway={() => {
          setShowFailureModal(false);
        }}
      />

      {/* Step 1: Submission Confirmation Modal */}
      <SubmissionConfirmModal
        visible={showConfirmModal}
        photosCount={photosCount}
        aiVerifiedStatus={getAiVerifiedStatusSummary()}
        locationStatus={getLocationStatusSummary()}
        notesStatus={getNotesStatusSummary()}
        isLoading={isSubmitting}
        onCancel={() => setShowConfirmModal(false)}
        onVerify={handleConfirmBackendSubmit}
      />

      {/* Step 2: Work Submitted Success Modal */}
      <WorkSubmittedModal
        visible={showSuccessModal}
        workOrderId={
          submittedProjectResult?.projectId || project?.projectId || "WO-SUBMITTED"
        }
        photosCount={
          submittedProjectResult?.photos?.length || project?.photos?.length || photosCount
        }
        submittedAt={
          submittedProjectResult?.updatedAt ||
          submittedProjectResult?.createdAt ||
          new Date().toISOString()
        }
        onViewStatus={() => {
          setShowSuccessModal(false);
          if (projectId) {
            router.replace({
              pathname: "/(app)/project-details",
              params: { id: projectId },
            });
          } else {
            router.replace("/(app)/projects");
          }
        }}
        onBackToDashboard={() => {
          setShowSuccessModal(false);
          router.replace("/(app)");
        }}
      />
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
