import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
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
  revalidateProjectPhoto,
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
import {
  SubmissionErrorsModal,
  SubmissionErrorItem,
} from "@/src/components/submission/SubmissionErrorsModal";
import { calculateChecklistSubmissionReadiness } from "@/src/utils/checklistSubmission.utils";

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
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFailureModal, setShowFailureModal] = useState<boolean>(false);

  // Submission Flow Modals State
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [submittedProjectResult, setSubmittedProjectResult] =
    useState<VendorProjectItem | null>(null);

  // Backend Rejection Errors Modal State
  const [showErrorsModal, setShowErrorsModal] = useState<boolean>(false);
  const [submissionErrors, setSubmissionErrors] = useState<SubmissionErrorItem[]>([]);
  const [isRetryingSinglePhotoId, setIsRetryingSinglePhotoId] = useState<string | null>(null);

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
          matchedPhoto = [...photos].reverse().find(
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

  const handleRetryVerification = async () => {
    const activePhotoId = targetPhoto?._id ? String(targetPhoto._id) : photoId;
    if (!projectId || !activePhotoId || isRevalidating) return;

    try {
      setIsRevalidating(true);
      const updatedProject = await revalidateProjectPhoto(projectId, activePhotoId);
      setProject(updatedProject);

      const photos = updatedProject.photos || [];
      const matched = photos.find((p) => String(p._id) === activePhotoId);
      if (matched) {
        setTargetPhoto(matched);
        if (matched.aiValidation?.status === "PASSED") {
          setShowFailureModal(false);
          Alert.alert(
            "Verification Passed",
            "Photo passed all AI quality and category checks!"
          );
        } else if (matched.aiValidation?.status === "FAILED") {
          setShowFailureModal(true);
        } else {
          // PENDING (e.g. transient 502/503)
          setShowFailureModal(false);
          Alert.alert(
            "Verification In Progress",
            matched.aiValidation?.reason ||
              "Verification is still processing. Please try again shortly."
          );
        }
      }
    } catch (err: any) {
      console.error("Failed to revalidate photo:", err);
      let errMsg = err?.response?.data?.message;
      if (!errMsg) {
        if (err?.response?.status === 502 || err?.message?.includes("502")) {
          errMsg =
            "AI verification service is temporarily unavailable (HTTP 502). Please retry in a moment.";
        } else if (err?.code === "ECONNABORTED" || err?.message?.includes("timeout")) {
          errMsg =
            "AI verification timed out. The service may be waking up. Please retry in a moment.";
        } else {
          errMsg = err?.message || "Failed to re-run AI verification.";
        }
      }
      Alert.alert("Verification Notice", errMsg);
    } finally {
      setIsRevalidating(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const activePhotoId = targetPhoto?._id ? String(targetPhoto._id) : photoId;
    if (targetPhoto?.aiValidation?.status === "PENDING" && projectId && activePhotoId) {
      try {
        const updatedProject = await revalidateProjectPhoto(projectId, activePhotoId);
        setProject(updatedProject);
        const photos = updatedProject.photos || [];
        const matched = photos.find((p) => String(p._id) === activePhotoId);
        if (matched) {
          setTargetPhoto(matched);
          if (matched.aiValidation?.status === "FAILED") {
            setShowFailureModal(true);
          }
        }
        setIsRefreshing(false);
        return;
      } catch {
        // Fallback to fetchProjectDetails
      }
    }
    fetchProjectDetails(false);
  }, [projectId, targetPhoto, photoId, fetchProjectDetails]);

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
          errors?: SubmissionErrorItem[];
        };

        const errorsList = responseData.errors;

        if (Array.isArray(errorsList) && errorsList.length > 0) {
          setShowConfirmModal(false);
          setSubmissionErrors(errorsList);
          setShowErrorsModal(true);
          return;
        }

        const mainMessage = responseData.message || responseData.error || "";
        if (mainMessage) {
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

  const handleSubmissionErrorRetake = (errorItem: SubmissionErrorItem) => {
    setShowErrorsModal(false);
    router.push({
      pathname: "/(app)/capture",
      params: {
        id: projectId,
        checklistItemId: errorItem.checklistItemId,
      },
    });
  };

  const handleSubmissionErrorRetry = async (errorItem: SubmissionErrorItem) => {
    if (!projectId || !errorItem.photoId || isRetryingSinglePhotoId) return;

    try {
      setIsRetryingSinglePhotoId(errorItem.photoId);
      const updatedProject = await revalidateProjectPhoto(projectId, errorItem.photoId);
      setProject(updatedProject);

      const photos = updatedProject.photos || [];
      const matched = photos.find((p) => String(p._id) === String(errorItem.photoId));
      if (matched) {
        if (String(targetPhoto?._id) === String(errorItem.photoId)) {
          setTargetPhoto(matched);
        }

        if (matched.aiValidation?.status === "PASSED") {
          const remaining = submissionErrors.filter(
            (e) => String(e.photoId) !== String(errorItem.photoId)
          );
          setSubmissionErrors(remaining);

          if (remaining.length === 0) {
            setShowErrorsModal(false);
            Alert.alert(
              "All Requirements Passed",
              "All checklist photos have passed verification! You can now submit your work order.",
              [
                { text: "Review Details", style: "cancel" },
                {
                  text: "Submit Work Order",
                  onPress: () => setShowConfirmModal(true),
                },
              ]
            );
          } else {
            Alert.alert(
              "Verification Passed",
              `Photo for "${errorItem.category || "category"}" successfully passed AI verification!`
            );
          }
        } else {
          Alert.alert(
            "Verification Incomplete",
            matched.aiValidation?.reason ||
              "Photo did not pass AI verification. Retaking the photo is recommended."
          );
        }
      }
    } catch (err: any) {
      console.error("Failed to revalidate photo from submission errors modal:", err);
      let errMsg = err?.response?.data?.message;
      if (!errMsg) {
        if (err?.response?.status === 502 || err?.message?.includes("502")) {
          errMsg =
            "AI verification service is temporarily unavailable (HTTP 502). Please retry in a moment.";
        } else if (err?.code === "ECONNABORTED" || err?.message?.includes("timeout")) {
          errMsg =
            "AI verification timed out. The service may be waking up. Please retry in a moment.";
        } else {
          errMsg = err?.message || "Failed to re-run AI verification.";
        }
      }
      Alert.alert("Verification Notice", errMsg);
    } finally {
      setIsRetryingSinglePhotoId(null);
    }
  };

  const currentStatus: "PASSED" | "FAILED" | "PENDING" =
    targetPhoto?.aiValidation?.status || "PENDING";
  const displayImageUri = targetPhoto?.url || photoUri;
  const categoryItem = project?.checklistItems?.find(
    (item) =>
      String(item.id) === String(checklistItemId || targetPhoto?.checklistItemId)
  );

  const isSubjectMismatch =
    targetPhoto?.aiValidation?.subject?.passed === false ||
    targetPhoto?.aiValidation?.subject?.status === "FAILED" ||
    (Boolean(targetPhoto?.aiValidation?.reason) &&
      (targetPhoto!.aiValidation!.reason!.toLowerCase().includes("instead of") ||
        targetPhoto!.aiValidation!.reason!.toLowerCase().includes("mismatch") ||
        targetPhoto!.aiValidation!.reason!.toLowerCase().includes("does not show")));

  // Authoritative checklist submission readiness matching backend submitVendorProject rules
  const checklistReadiness = calculateChecklistSubmissionReadiness(
    project?.checklistItems,
    project?.photos
  );

  const uploadedPhotosList = project?.photos || [];
  const photosCount = uploadedPhotosList.length;

  const getAiVerifiedStatusSummary = (): "All Passed" | "Pending" | "Failed" => {
    return checklistReadiness.aiVerifiedStatus;
  };

  const submitButtonLabel = checklistReadiness.isReadyForSubmission
    ? "Submit Work Order for Review"
    : `Submit Work Order (${checklistReadiness.verifiedCount}/${checklistReadiness.totalCount} Verified)`;

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

  const handleNavToCapture = () => {
    setShowFailureModal(false);
    router.push({
      pathname: "/(app)/capture",
      params: {
        id: projectId,
        checklistItemId: categoryItem?.id || targetPhoto?.checklistItemId,
      },
    });
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

          {/* Action Buttons Group for Non-Passed Photos (FAILED or PENDING) */}
          {currentStatus !== "PASSED" && targetPhoto?._id && (
            <View style={styles.actionButtonGroup}>
              {/* Subject Mismatch Warning Banner */}
              {isSubjectMismatch && (
                <View style={styles.subjectMismatchNotice}>
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text style={styles.subjectMismatchNoticeText}>
                    Subject mismatch detected: this photo does not match &quot;
                    {categoryItem?.label || targetPhoto?.category}&quot;. Retaking the photo
                    with the expected subject is strongly recommended before proceeding.
                  </Text>
                </View>
              )}

              {/* Transient 502/503 Notice Banner */}
              {currentStatus === "PENDING" &&
                Boolean(
                  targetPhoto?.aiValidation?.reason?.includes("502") ||
                    targetPhoto?.aiValidation?.reason?.includes("503") ||
                    targetPhoto?.aiValidation?.reason?.includes("unavailable")
                ) && (
                  <View style={styles.transientNotice}>
                    <Ionicons name="information-circle" size={18} color="#D97706" />
                    <Text style={styles.transientNoticeText}>
                      The AI service was temporarily busy. You can retry verification now.
                    </Text>
                  </View>
                )}

              {/* If FAILED: Retake is prominent, Retry is available */}
              {currentStatus === "FAILED" ? (
                <>
                  <Pressable
                    style={styles.retakeButtonMain}
                    onPress={handleNavToCapture}
                    accessibilityRole="button"
                    accessibilityLabel="Retake Photo"
                  >
                    <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.retakeButtonMainText}>
                      {isSubjectMismatch ? "Retake Photo (Recommended)" : "Retake Photo"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.secondaryRetryButton,
                      isRevalidating && styles.disabledButton,
                    ]}
                    onPress={handleRetryVerification}
                    disabled={isRevalidating}
                    accessibilityRole="button"
                    accessibilityLabel="Retry AI Verification"
                  >
                    {isRevalidating ? (
                      <>
                        <ActivityIndicator size="small" color="#D97706" />
                        <Text style={styles.secondaryRetryButtonText}>
                          Verifying with AI...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="refresh-outline" size={18} color="#D97706" />
                        <Text style={styles.secondaryRetryButtonText}>
                          Retry AI Verification
                        </Text>
                      </>
                    )}
                  </Pressable>
                </>
              ) : (
                /* If PENDING: Retry is prominent, Retake is also available */
                <>
                  <Pressable
                    style={[
                      styles.retryButton,
                      isRevalidating && styles.disabledButton,
                    ]}
                    onPress={handleRetryVerification}
                    disabled={isRevalidating}
                    accessibilityRole="button"
                    accessibilityLabel="Retry AI Verification"
                  >
                    {isRevalidating ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.retryButtonText}>Verifying with AI...</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.retryButtonText}>Retry AI Verification</Text>
                      </>
                    )}
                  </Pressable>

                  <Pressable
                    style={styles.retakeButtonOutline}
                    onPress={handleNavToCapture}
                    accessibilityRole="button"
                    accessibilityLabel="Retake Photo"
                  >
                    <Ionicons name="camera-outline" size={18} color="#475569" />
                    <Text style={styles.retakeButtonOutlineText}>Retake Photo</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}

          {/* Detailed Verification Checks */}
          <VerificationChecks photo={targetPhoto || undefined} project={project} />

          {/* Checklist Verification Progress Banner when this photo passed but overall project is still incomplete */}
          {currentStatus === "PASSED" && !checklistReadiness.isReadyForSubmission && (
            <View style={styles.checklistProgressBanner}>
              <Ionicons name="information-circle" size={20} color="#0284C7" />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.checklistProgressBannerTitle}>
                  Photo passed ({checklistReadiness.verifiedCount} of {checklistReadiness.totalCount} checklist items ready)
                </Text>
                <Text style={styles.checklistProgressBannerSubtitle}>
                  Submitting for client review requires all {checklistReadiness.totalCount} checklist categories to pass AI verification.
                </Text>
              </View>
            </View>
          )}

          {/* Primary Action Submit Button */}
          <SubmitPhotoButton
            onPress={handleOpenSubmissionConfirm}
            isLoading={isSubmitting}
            status={currentStatus}
            label={submitButtonLabel}
            accessibilityLabel={submitButtonLabel}
          />

          {/* Return to Checklist / Camera Button when more items need verification */}
          {currentStatus === "PASSED" && !checklistReadiness.isReadyForSubmission && (
            <Pressable
              style={styles.returnToChecklistButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Return to Camera & Checklist"
            >
              <Ionicons name="arrow-back-outline" size={17} color="#475569" />
              <Text style={styles.returnToChecklistButtonText}>
                Return to Camera & Checklist
              </Text>
            </Pressable>
          )}
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
          isSubjectMismatch
            ? "CHECK FAILED: SUBJECT MISMATCH"
            : targetPhoto?.aiValidation?.subject?.reason
            ? `CHECK FAILED: ${targetPhoto.aiValidation.subject.reason.toUpperCase()}`
            : "CHECK FAILED: QUALITY ISSUE"
        }
        isSubjectMismatch={isSubjectMismatch}
        isRevalidating={isRevalidating}
        onRetry={handleRetryVerification}
        onRetakePhoto={handleNavToCapture}
        onProceedAnyway={() => {
          setShowFailureModal(false);
          setShowConfirmModal(true);
        }}
      />

      {/* Step 1: Submission Confirmation Modal */}
      <SubmissionConfirmModal
        visible={showConfirmModal}
        photosCount={photosCount}
        aiVerifiedStatus={checklistReadiness.aiVerifiedStatus}
        locationStatus={getLocationStatusSummary()}
        notesStatus={getNotesStatusSummary()}
        checklistProgressText={checklistReadiness.progressText}
        verifiedChecklistCount={checklistReadiness.verifiedCount}
        totalChecklistCount={checklistReadiness.totalCount}
        unresolvedItems={checklistReadiness.unresolvedItems}
        isLoading={isSubmitting}
        onCancel={() => setShowConfirmModal(false)}
        onVerify={handleConfirmBackendSubmit}
      />

      {/* Backend Submission Validation Errors Modal */}
      <SubmissionErrorsModal
        visible={showErrorsModal}
        errors={submissionErrors}
        isRetryingPhotoId={isRetryingSinglePhotoId}
        onClose={() => setShowErrorsModal(false)}
        onRetake={handleSubmissionErrorRetake}
        onRetry={handleSubmissionErrorRetry}
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
    paddingBottom: 100,
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
  actionButtonGroup: {
    marginBottom: 16,
    gap: 10,
  },
  subjectMismatchNotice: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  subjectMismatchNoticeText: {
    flex: 1,
    fontSize: 12.5,
    color: "#991B1B",
    lineHeight: 17,
    fontWeight: "600",
  },
  transientNotice: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  transientNoticeText: {
    flex: 1,
    fontSize: 12.5,
    color: "#92400E",
    lineHeight: 17,
    fontWeight: "600",
  },
  retryButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#D97706",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryRetryButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderColor: "#F59E0B",
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryRetryButtonText: {
    color: "#D97706",
    fontSize: 15,
    fontWeight: "700",
  },
  retakeButtonMain: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#78716C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retakeButtonMainText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  retakeButtonOutline: {
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD5E1",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retakeButtonOutlineText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  checklistProgressBanner: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  checklistProgressBannerTitle: {
    fontSize: 13,
    color: "#0369A1",
    fontWeight: "700",
    lineHeight: 18,
  },
  checklistProgressBannerSubtitle: {
    fontSize: 12,
    color: "#0C4A6E",
    lineHeight: 16,
  },
  returnToChecklistButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: -12,
    marginBottom: 24,
  },
  returnToChecklistButtonText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },
});
