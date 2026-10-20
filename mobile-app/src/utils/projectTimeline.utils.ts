import type { VendorProjectItem, VendorProjectPhoto } from "../api/dashboard.api";
import type { AuditLogItem } from "../api/audit.api";
import type { TimelineStepItem } from "../components/projects/ProjectTimelineItem";
import { calculateChecklistSubmissionReadiness } from "./checklistSubmission.utils";

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
 * 1. Project Assigned — Work order received from the client.
 * 2. Assignment Accepted — Vendor accepted the work order.
 * 3. Staff Assigned — Vendor assigned a staff member to the project.
 * 4. Photos Captured — Show actual checklist/photo progress, such as 3 of 5 categories completed.
 * 5. All Photos Submitted — Indicates that the vendor submitted the work order for client review.
 * 6. AI Verification — Reflects the actual AI verification state of the required checklist photos.
 * 7. Client Review — Shows whether the submission is awaiting review, approved, or rejected.
 * 8. Project Completed — Reflects the actual completion state after the required approval and payment workflow.
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
  const isRejected = statusUpper === "REJECTED";

  // Index relevant audit log events
  const findLog = (actions: string[]) =>
    auditLogs.find((l) => actions.includes(l.action));

  const createdLog = findLog(["PROJECT_CREATED", "PROJECT_ASSIGNED"]);
  const acceptedLog = findLog(["PROJECT_ACCEPTED"]);
  const staffAssignedLog = findLog(["PROJECT_STAFF_ASSIGNED"]);
  const submittedLog = findLog(["PROJECT_SUBMITTED"]);
  const approvedLog = auditLogs.find(
    (l) =>
      l.action === "PROJECT_STATUS_CHANGED" &&
      (l.metadata?.newStatus === "Approved" ||
        l.metadata?.newStatus === "APPROVED")
  );
  const rejectedLog = auditLogs.find(
    (l) =>
      l.action === "PROJECT_STATUS_CHANGED" &&
      (l.metadata?.newStatus === "Rejected" ||
        l.metadata?.newStatus === "REJECTED")
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

  // AI validation timestamps
  const aiValidationTimestamps = photos
    .map((p) => p.aiValidation?.validatedAt)
    .filter(Boolean)
    .map((d) => new Date(d!).getTime())
    .filter((t) => !isNaN(t));

  const latestAiValidationTime =
    aiValidationTimestamps.length > 0
      ? Math.max(...aiValidationTimestamps)
      : null;

  const hasPhotos = photos.length > 0;
  const allCategoriesCaptured =
    totalCategories > 0 && capturedCategories >= totalCategories;

  // Authoritative AI verification evaluation
  const aiReadiness = calculateChecklistSubmissionReadiness(
    project.checklistItems,
    project.photos
  );

  // Staff assignment state derived from persisted fields or audit log
  const isStaffAssigned = Boolean(
    project.assignedStaffId || staffAssignedLog
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
      : "Work order received from client",
    status: isNew ? "current" : "completed",
  };

  // -------------------------------------------------------------
  // Milestone 2: Assignment Accepted
  // -------------------------------------------------------------
  const isAcceptedCompleted =
    Boolean(acceptedLog) ||
    isAssigned ||
    isStaffAssigned ||
    isInProgress ||
    isSubmitted ||
    isUnderReview ||
    isApproved ||
    isCompleted;

  const isAcceptedCurrent = !isAcceptedCompleted && isNew;

  const step2: TimelineStepItem = {
    id: "milestone-2-accepted",
    title: "Assignment Accepted",
    dateText: acceptedLog?.createdAt
      ? formatTimelineDate(acceptedLog.createdAt)
      : isAcceptedCompleted
      ? "Completed"
      : "Pending",
    description: isAcceptedCompleted
      ? "Vendor accepted the work order"
      : "Awaiting work order acceptance",
    status: isAcceptedCompleted
      ? "completed"
      : isAcceptedCurrent
      ? "current"
      : "pending",
  };

  // -------------------------------------------------------------
  // Milestone 3: Staff Assigned
  // -------------------------------------------------------------
  const isStaffAssignedCurrent = !isStaffAssigned && isAcceptedCompleted;
  const staffName =
    project.assignedStaffName ||
    staffAssignedLog?.metadata?.staffName ||
    "";

  const step3: TimelineStepItem = {
    id: "milestone-3-staff-assigned",
    title: "Staff Assigned",
    dateText: staffAssignedLog?.createdAt
      ? formatTimelineDate(staffAssignedLog.createdAt)
      : isStaffAssigned
      ? "Completed"
      : "Pending",
    description: isStaffAssigned
      ? staffName
        ? `Assigned to ${staffName}`
        : "Staff member assigned to project"
      : "Vendor assigned a staff member to the project",
    status: isStaffAssigned
      ? "completed"
      : isStaffAssignedCurrent
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
    (isStaffAssigned || hasPhotos || isInProgress);

  let photosCapturedDesc = "Checklist photos pending capture";
  if (totalCategories > 0) {
    photosCapturedDesc = `${capturedCategories} of ${totalCategories} categories completed`;
  } else if (hasPhotos) {
    photosCapturedDesc = `${photos.length} photo${photos.length === 1 ? "" : "s"} captured`;
  }

  const step4: TimelineStepItem = {
    id: "milestone-4-photos",
    title: "Photos Captured",
    dateText: latestPhotoTime
      ? formatTimelineDate(latestPhotoTime)
      : isPhotosCompleted
      ? "Completed"
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
    isSubmitted ||
    isUnderReview ||
    isApproved ||
    isCompleted ||
    Boolean(submittedLog);

  const isSubmittedCurrent =
    !isSubmittedCompleted &&
    allCategoriesCaptured &&
    aiReadiness.isReadyForSubmission;

  const step5: TimelineStepItem = {
    id: "milestone-5-submitted",
    title: "All Photos Submitted",
    dateText: submittedLog?.createdAt
      ? formatTimelineDate(submittedLog.createdAt)
      : isSubmittedCompleted
      ? "Completed"
      : "Pending",
    description: isSubmittedCompleted
      ? "Work order and all photos submitted for client review"
      : isSubmittedCurrent
      ? "Ready to submit for client review"
      : "Awaiting photo capture and submission",
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
    aiReadiness.aiVerifiedStatus === "All Passed" ||
    isSubmitted ||
    isUnderReview ||
    isApproved ||
    isCompleted;

  const isAiFailed =
    !isAiCompleted && aiReadiness.aiVerifiedStatus === "Failed";

  const isAiCurrent =
    !isAiCompleted &&
    (isAiFailed || (hasPhotos && isInProgress));

  let aiDesc = "Automated quality check";
  if (isAiCompleted) {
    aiDesc = "Automated quality check passed";
  } else if (isAiFailed) {
    aiDesc = "Automated quality check failed — retake required";
  } else if (isAiCurrent) {
    aiDesc = aiReadiness.progressText || "Automated quality check in progress";
  }

  const step6: TimelineStepItem = {
    id: "milestone-6-ai",
    title: "AI Verification",
    dateText: isAiCompleted
      ? latestAiValidationTime
        ? formatTimelineDate(latestAiValidationTime)
        : latestPhotoTime
        ? formatTimelineDate(latestPhotoTime)
        : "Completed"
      : isAiFailed
      ? "Failed"
      : isAiCurrent
      ? "In Progress"
      : "Pending",
    description: aiDesc,
    status: isAiCompleted
      ? "completed"
      : isAiCurrent
      ? "current"
      : "pending",
  };

  // -------------------------------------------------------------
  // Milestone 7: Client Review
  // -------------------------------------------------------------
  const isReviewApproved =
    isApproved || isCompleted || Boolean(approvedLog);
  const isReviewRejected =
    statusUpper === "REJECTED" || Boolean(rejectedLog);
  const isReviewCurrent = isSubmitted || isUnderReview;

  let reviewDesc = "Awaiting client review";
  if (isReviewApproved) {
    reviewDesc = "Work approved by client";
  } else if (isReviewRejected) {
    reviewDesc = project.rejectionReason
      ? `Submission rejected: ${project.rejectionReason}`
      : "Submission rejected by client";
  } else if (isReviewCurrent) {
    reviewDesc = "Awaiting client review and approval";
  }

  const step7: TimelineStepItem = {
    id: "milestone-7-review",
    title: "Client Review",
    dateText: isReviewApproved
      ? approvedLog?.createdAt
        ? formatTimelineDate(approvedLog.createdAt)
        : "Completed"
      : isReviewRejected
      ? rejectedLog?.createdAt
        ? formatTimelineDate(rejectedLog.createdAt)
        : "Rejected"
      : isReviewCurrent
      ? "In Review"
      : "Pending",
    description: reviewDesc,
    status: isReviewApproved
      ? "completed"
      : (isReviewCurrent || isReviewRejected)
      ? "current"
      : "pending",
  };

  // -------------------------------------------------------------
  // Milestone 8: Project Completed
  // -------------------------------------------------------------
  const isProjectCompleted = isCompleted || Boolean(completedLog);
  const isProjectCompletedCurrent =
    !isProjectCompleted && isReviewApproved;

  const step8: TimelineStepItem = {
    id: "milestone-8-completed",
    title: "Project Completed",
    dateText: isProjectCompleted
      ? completedLog?.createdAt
        ? formatTimelineDate(completedLog.createdAt)
        : "Completed"
      : "Pending",
    description: isProjectCompleted
      ? "Project completed and payment processed"
      : isProjectCompletedCurrent
      ? "Approved — ready for invoice & payment"
      : "Payment processed upon completion",
    status: isProjectCompleted
      ? "completed"
      : isProjectCompletedCurrent
      ? "current"
      : "pending",
  };

  return [step1, step2, step3, step4, step5, step6, step7, step8];
};
