import type { VendorProjectItem, VendorProjectPhoto } from "../api/dashboard.api";
import type { AuditLogItem } from "../api/audit.api";
import type { TimelineStepItem } from "../components/projects/ProjectTimelineItem";

/**
 * Helper to format ISO date strings into "MMM d, h:mm a" format (e.g. "Mar 9, 10:00 AM")
 */
export const formatTimelineDate = (
  dateStringOrMs?: string | number | null
): string => {
  if (!dateStringOrMs) return "Pending";
  try {
    const d = new Date(dateStringOrMs);
    if (isNaN(d.getTime())) return "Pending";

    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Pending";
  }
};

/**
 * Builds the canonical 8-milestone chronological project timeline derived
 * strictly from persisted project fields, photo metadata, and audit logs:
 * 1. Project Assigned
 * 2. Assignment Accepted
 * 3. Arrived On Site
 * 4. Photos Captured
 * 5. All Photos Submitted
 * 6. AI Verification
 * 7. Client Review
 * 8. Project Completed
 */
export const buildProjectTimeline = (
  project?: VendorProjectItem | null,
  auditLogs: AuditLogItem[] = []
): TimelineStepItem[] => {
  if (!project) return [];

  const statusUpper = (project.status || "").trim().toUpperCase();
  const isNew = statusUpper === "NEW";
  const isAssigned = statusUpper === "ASSIGNED";
  const isInProgress =
    statusUpper === "IN PROGRESS" || statusUpper === "INPROGRESS";
  const isSubmitted = statusUpper === "SUBMITTED";
  const isUnderReview =
    statusUpper === "UNDER REVIEW" || statusUpper === "UNDERREVIEW";
  const isApproved = statusUpper === "APPROVED";
  const isCompleted = statusUpper === "COMPLETED";

  // Index relevant audit log events
  const findLog = (actions: string[]) =>
    auditLogs.find((l) => actions.includes(l.action));

  const createdLog = findLog(["PROJECT_CREATED", "PROJECT_ASSIGNED"]);
  const acceptedLog = findLog([
    "PROJECT_ACCEPTED",
    "PROJECT_STAFF_ASSIGNED",
  ]);
  const submittedLog = findLog(["PROJECT_SUBMITTED"]);
  const approvedLog = auditLogs.find(
    (l) =>
      l.action === "PROJECT_STATUS_CHANGED" &&
      (l.metadata?.newStatus === "Approved" ||
        l.metadata?.newStatus === "APPROVED")
  );
  const completedLog = auditLogs.find(
    (l) =>
      (l.action === "PROJECT_STATUS_CHANGED" &&
        (l.metadata?.newStatus === "Completed" ||
          l.metadata?.newStatus === "COMPLETED")) ||
      l.action === "INVOICE_PAID" ||
      l.action === "PAYMENT_RECORDED"
  );

  // Photos and checklist analysis
  const photos: VendorProjectPhoto[] = Array.isArray(project.photos)
    ? project.photos
    : [];
  const checklist = Array.isArray(project.checklistItems)
    ? project.checklistItems
    : [];
  const totalCategories = checklist.length;

  // Number of categories with at least one photo
  const capturedCategories = checklist.filter((item) =>
    photos.some((p) => String(p.checklistItemId) === String(item.id))
  ).length;

  // Real photo timestamps
  const photoTimestamps = photos
    .map((p) => p.capturedAt || p.uploadedAt)
    .filter(Boolean)
    .map((d) => new Date(d!).getTime())
    .filter((t) => !isNaN(t));

  const earliestPhotoTime =
    photoTimestamps.length > 0 ? Math.min(...photoTimestamps) : null;
  const latestPhotoTime =
    photoTimestamps.length > 0 ? Math.max(...photoTimestamps) : null;

  const hasPhotos = photos.length > 0;
  const allCategoriesCaptured =
    totalCategories > 0 && capturedCategories >= totalCategories;

  // All photos passed AI verification check
  const allPhotosAiPassed =
    hasPhotos &&
    photos.every((p) => p.aiValidation?.status === "PASSED");
  const anyAiFailed = photos.some(
    (p) => p.aiValidation?.status === "FAILED"
  );
  const anyAiPending = photos.some(
    (p) => !p.aiValidation || p.aiValidation.status === "PENDING"
  );

  // -------------------------------------------------------------
  // Milestone 1: Project Assigned
  // -------------------------------------------------------------
  const assignedTimestamp = createdLog?.createdAt || project.createdAt;
  const step1: TimelineStepItem = {
    id: "milestone-1-assigned",
    title: "Project Assigned",
    dateText: formatTimelineDate(assignedTimestamp),
    description: project.client
      ? `Work order received from ${project.client}`
      : "Work order received",
    status: isNew ? "current" : "completed",
  };

  // -------------------------------------------------------------
  // Milestone 2: Assignment Accepted
  // -------------------------------------------------------------
  const isAcceptedCompleted =
    Boolean(acceptedLog) ||
    Boolean(project.assignedStaffId) ||
    isInProgress ||
    isSubmitted ||
    isUnderReview ||
    isApproved ||
    isCompleted;

  const isAcceptedCurrent = !isAcceptedCompleted && isAssigned;
  const acceptedTimestamp = acceptedLog?.createdAt || (isAcceptedCompleted ? project.createdAt : null);

  const step2: TimelineStepItem = {
    id: "milestone-2-accepted",
    title: "Assignment Accepted",
    dateText: isAcceptedCompleted
      ? formatTimelineDate(acceptedTimestamp)
      : "Pending",
    description: isAcceptedCompleted
      ? "You accepted the work order"
      : "Awaiting work order acceptance",
    status: isAcceptedCompleted
      ? "completed"
      : isAcceptedCurrent
      ? "current"
      : "pending",
  };

  // -------------------------------------------------------------
  // Milestone 3: Arrived On Site
  // -------------------------------------------------------------
  const isArrivedCompleted =
    hasPhotos || isSubmitted || isUnderReview || isApproved || isCompleted;
  const isArrivedCurrent = !isArrivedCompleted && isInProgress;

  const step3: TimelineStepItem = {
    id: "milestone-3-arrived",
    title: "Arrived On Site",
    dateText: isArrivedCompleted
      ? formatTimelineDate(earliestPhotoTime || project.createdAt)
      : isArrivedCurrent
      ? "In Progress"
      : "Pending",
    description: isArrivedCompleted
      ? "GPS check-in confirmed at location"
      : "GPS check-in pending at project location",
    status: isArrivedCompleted
      ? "completed"
      : isArrivedCurrent
      ? "current"
      : "pending",
  };

  // -------------------------------------------------------------
  // Milestone 4: Photos Captured
  // -------------------------------------------------------------
  const isPhotosCompleted =
    (allCategoriesCaptured && totalCategories > 0) ||
    isSubmitted ||
    isUnderReview ||
    isApproved ||
    isCompleted;

  const isPhotosCurrent =
    !isPhotosCompleted &&
    ((hasPhotos && isInProgress) || (isArrivedCompleted && isInProgress));

  let photosCapturedDesc = "Complete remaining categories";
  if (totalCategories > 0) {
    photosCapturedDesc = `${capturedCategories} of ${totalCategories} categories completed`;
  } else if (hasPhotos) {
    photosCapturedDesc = `${photos.length} photos captured`;
  }

  const step4: TimelineStepItem = {
    id: "milestone-4-photos",
    title: "Photos Captured",
    dateText:
      isPhotosCompleted || isPhotosCurrent
        ? formatTimelineDate(latestPhotoTime || earliestPhotoTime || project.createdAt)
        : "Pending",
    description: photosCapturedDesc,
    status: isPhotosCompleted
      ? "completed"
      : isPhotosCurrent
      ? "current"
      : "pending",
  };

  // -------------------------------------------------------------
  // Milestone 5: All Photos Submitted
  // -------------------------------------------------------------
  const isSubmittedCompleted =
    isSubmitted || isUnderReview || isApproved || isCompleted;
  const isSubmittedCurrent =
    !isSubmittedCompleted && allCategoriesCaptured && isInProgress;

  const step5: TimelineStepItem = {
    id: "milestone-5-submitted",
    title: "All Photos Submitted",
    dateText: isSubmittedCompleted
      ? formatTimelineDate(submittedLog?.createdAt || project.updatedAt)
      : "Pending",
    description: isSubmittedCompleted
      ? "Work order and all photos submitted for review"
      : isSubmittedCurrent
      ? "Ready to submit for client review"
      : "Complete remaining categories",
    status: isSubmittedCompleted
      ? "completed"
      : isSubmittedCurrent
      ? "current"
      : "pending",
  };

  // -------------------------------------------------------------
  // Milestone 6: AI Verification
  // -------------------------------------------------------------
  const isAiCompleted =
    isApproved ||
    isCompleted ||
    isSubmitted ||
    isUnderReview ||
    (allCategoriesCaptured && allPhotosAiPassed);

  const isAiCurrent =
    !isAiCompleted &&
    hasPhotos &&
    (anyAiPending || anyAiFailed) &&
    isInProgress;

  const step6: TimelineStepItem = {
    id: "milestone-6-ai",
    title: "AI Verification",
    dateText: isAiCompleted
      ? formatTimelineDate(latestPhotoTime || project.updatedAt)
      : isAiCurrent
      ? "In Progress"
      : "Pending",
    description: isAiCompleted
      ? "Automated quality check passed"
      : "Automated quality check",
    status: isAiCompleted
      ? "completed"
      : isAiCurrent
      ? "current"
      : "pending",
  };

  // -------------------------------------------------------------
  // Milestone 7: Client Review
  // -------------------------------------------------------------
  const isReviewCompleted = isApproved || isCompleted;
  const isReviewCurrent = isSubmitted || isUnderReview;

  const step7: TimelineStepItem = {
    id: "milestone-7-review",
    title: "Client Review",
    dateText: isReviewCompleted
      ? formatTimelineDate(approvedLog?.createdAt || project.updatedAt)
      : "Pending",
    description: isReviewCompleted
      ? "Work approved by client"
      : "Awaiting client approval",
    status: isReviewCompleted
      ? "completed"
      : isReviewCurrent
      ? "current"
      : "pending",
  };

  // -------------------------------------------------------------
  // Milestone 8: Project Completed
  // -------------------------------------------------------------
  const isProjectCompleted = isCompleted;
  const isProjectCompletedCurrent = !isProjectCompleted && isApproved;

  const step8: TimelineStepItem = {
    id: "milestone-8-completed",
    title: "Project Completed",
    dateText: isProjectCompleted
      ? formatTimelineDate(completedLog?.createdAt || project.updatedAt)
      : "Pending",
    description: isProjectCompleted
      ? "Project completed and payment processed"
      : isProjectCompletedCurrent
      ? "Approved - ready for invoice & payment"
      : "Payment processed",
    status: isProjectCompleted
      ? "completed"
      : isProjectCompletedCurrent
      ? "current"
      : "pending",
  };

  return [step1, step2, step3, step4, step5, step6, step7, step8];
};
