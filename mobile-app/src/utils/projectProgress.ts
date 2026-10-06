/**
 * Calculates the FieldCam Project Workflow Progress Percentage.
 *
 * CORE BUSINESS RULES:
 * 1. 100% progress is ONLY granted when project status is "Approved" (or "Completed").
 * 2. "In Progress" projects MUST NEVER display 100%, even if 100% of checklist items are completed,
 *    because vendor submission, admin review, and admin approval are still required.
 * 3. "Submitted" / "Under Review" projects display 95%.
 * 4. "New" / "ASSIGNED" projects display 0%.
 * 5. "Rejected" projects display pre-approval workflow progress (95%), never 100%.
 */

export interface ChecklistItemLike {
  checked: boolean;
}

export function getProjectProgress(
  statusRaw?: string,
  checklistItems?: ChecklistItemLike[] | null,
  rawProgress?: number | null
): number {
  const status = (statusRaw || "").trim().toUpperCase();

  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return 100;

    case "SUBMITTED":
    case "UNDER REVIEW":
    case "IN REVIEW":
      return 95;

    case "NEW":
    case "ASSIGNED":
      return 0;

    case "REJECTED":
      return 95;

    case "IN PROGRESS": {
      let checklistProgress: number | null = null;

      if (Array.isArray(checklistItems) && checklistItems.length > 0) {
        const checkedCount = checklistItems.filter((item) => item.checked).length;
        checklistProgress = Math.round((checkedCount / checklistItems.length) * 100);
      } else if (typeof rawProgress === "number" && !isNaN(rawProgress)) {
        checklistProgress = Math.round(rawProgress);
      }

      if (checklistProgress !== null) {
        // Cap "In Progress" work at 90% max so it never hits 100% prior to Admin Approval
        return Math.min(90, Math.max(0, checklistProgress));
      }

      return 0;
    }

    default: {
      if (typeof rawProgress === "number" && !isNaN(rawProgress)) {
        return Math.min(95, Math.max(0, Math.round(rawProgress)));
      }
      return 0;
    }
  }
}
