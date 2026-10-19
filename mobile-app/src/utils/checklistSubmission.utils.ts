import type { VendorChecklistItem, VendorProjectPhoto } from "../api/dashboard.api";

export interface ChecklistItemStatusDetail {
  checklistItemId: string;
  category: string;
  status: "PASSED" | "FAILED" | "PENDING" | "MISSING";
  reason?: string;
  photoId?: string;
}

export type OverallAiVerificationStatus = "All Passed" | "Pending" | "Failed";

export interface ChecklistSubmissionReadiness {
  aiVerifiedStatus: OverallAiVerificationStatus;
  isReadyForSubmission: boolean;
  verifiedCount: number;
  totalCount: number;
  progressText: string;
  unresolvedItems: ChecklistItemStatusDetail[];
}

/**
 * Calculates project submission readiness strictly matching backend rules in submitVendorProject:
 * 1. Evaluates required project.checklistItems, ignoring unassociated photos (e.g. General photos).
 * 2. For each checklist item, selects the latest associated photo (associatedPhotos[length - 1]).
 * 3. If any item is missing a photo or has a PENDING photo, overall status is 'Pending'.
 * 4. If any item has a FAILED photo, overall status is 'Failed'.
 * 5. Returns 'All Passed' ONLY when every checklist item has an active photo with aiValidation.status === 'PASSED'.
 * 6. Handles missing or empty checklist data safely (returns 'Pending', never 'All Passed').
 */
export function calculateChecklistSubmissionReadiness(
  checklistItems?: VendorChecklistItem[] | null,
  photos?: VendorProjectPhoto[] | null
): ChecklistSubmissionReadiness {
  const checklist = Array.isArray(checklistItems) ? checklistItems : [];
  const photosList = Array.isArray(photos) ? photos : [];

  // Safe fallback if checklist data is missing or empty
  if (checklist.length === 0) {
    return {
      aiVerifiedStatus: "Pending",
      isReadyForSubmission: false,
      verifiedCount: 0,
      totalCount: 0,
      progressText: "0 of 0 checklist items verified",
      unresolvedItems: [],
    };
  }

  let verifiedCount = 0;
  let hasFailed = false;
  let hasPending = false;
  const unresolvedItems: ChecklistItemStatusDetail[] = [];

  for (const item of checklist) {
    const checklistItemId = String(item.id);

    // Associated photos strictly matching checklistItemId
    const associatedPhotos = photosList.filter(
      (photo) => String(photo.checklistItemId) === checklistItemId
    );

    if (associatedPhotos.length === 0) {
      hasPending = true;
      unresolvedItems.push({
        checklistItemId,
        category: item.label,
        status: "MISSING",
        reason: `Missing required photo evidence for checklist item "${item.label}"`,
      });
      continue;
    }

    // Backend rule: The latest photo in the array is the active current photo
    const activePhoto = associatedPhotos[associatedPhotos.length - 1];
    const photoId = activePhoto._id ? String(activePhoto._id) : undefined;
    const aiStatus = activePhoto.aiValidation?.status;

    if (aiStatus === "PASSED") {
      verifiedCount += 1;
    } else if (aiStatus === "FAILED") {
      hasFailed = true;
      unresolvedItems.push({
        checklistItemId,
        category: item.label,
        photoId,
        status: "FAILED",
        reason:
          activePhoto.aiValidation?.reason ||
          `AI validation failed for checklist item "${item.label}"`,
      });
    } else {
      // PENDING, missing status, or unrecognized status
      hasPending = true;
      unresolvedItems.push({
        checklistItemId,
        category: item.label,
        photoId,
        status: "PENDING",
        reason:
          activePhoto.aiValidation?.reason ||
          `AI validation is pending for checklist item "${item.label}"`,
      });
    }
  }

  let aiVerifiedStatus: OverallAiVerificationStatus = "Pending";
  if (hasFailed) {
    aiVerifiedStatus = "Failed";
  } else if (!hasPending && verifiedCount === checklist.length && checklist.length > 0) {
    aiVerifiedStatus = "All Passed";
  } else {
    aiVerifiedStatus = "Pending";
  }

  const isReadyForSubmission = aiVerifiedStatus === "All Passed";
  const progressText = `${verifiedCount} of ${checklist.length} checklist items verified`;

  return {
    aiVerifiedStatus,
    isReadyForSubmission,
    verifiedCount,
    totalCount: checklist.length,
    progressText,
    unresolvedItems,
  };
}
