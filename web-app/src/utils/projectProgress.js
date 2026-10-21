
export function getProjectProgress(statusRaw, checklistItems, rawProgress) {
  const status = (statusRaw || "").trim().toUpperCase();

  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return 100;

    case "SUBMITTED":
    case "UNDER REVIEW":
    case "IN REVIEW":
    case "REJECTED":
      return 95;

    case "NEW":
    case "ASSIGNED":
      return 0;

    case "IN PROGRESS": {
      let checklistProgress = null;

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

export default getProjectProgress;
