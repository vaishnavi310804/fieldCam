/**
 * FieldCam Audit Logs Utilities & Formatters
 */

export const SENSITIVE_KEY_REGEX =
  /password|hash|otp|token|secret|auth|bearer|credential/i;

/**
 * Format timestamp into readable localized date and time string.
 * @param {string|Date} dateString
 * @returns {string}
 */
export const formatAuditTimestamp = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

/**
 * Format raw action enum string into human-readable label.
 * e.g. "ADMIN_USER_CREATED" -> "Admin User Created"
 * @param {string} action
 * @returns {string}
 */
export const formatActionTitle = (action = "") => {
  if (!action || typeof action !== "string") return "—";
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Determine badge color styles based on action category.
 * @param {string} action
 * @returns {string} Tailwind CSS class string
 */
export const getActionColorClass = (action = "") => {
  const act = (action || "").toUpperCase();
  if (act.includes("CREATE") || act.includes("PUBLISHED") || act.includes("APPROVED")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200/70";
  }
  if (act.includes("REASSIGN") || act.includes("UPDATE") || act.includes("ASSIGN")) {
    return "bg-blue-50 text-blue-700 border-blue-200/70";
  }
  if (act.includes("STATUS") || act.includes("CHANGED") || act.includes("SENT")) {
    return "bg-amber-50 text-amber-700 border-amber-200/70";
  }
  if (act.includes("DELETE") || act.includes("REJECT") || act.includes("SUSPEND")) {
    return "bg-rose-50 text-rose-700 border-rose-200/70";
  }
  return "bg-[#FAF7F5] text-[#6E6763] border-[#EBE6E3]";
};

/**
 * Determine badge color styles based on actor role.
 * @param {string} role
 * @returns {string} Tailwind CSS class string
 */
export const getRoleColorClass = (role = "") => {
  const normalized = (role || "").toUpperCase();
  if (normalized === "SUPER_ADMIN") {
    return "bg-purple-50 text-purple-700 border-purple-200/70 font-bold";
  }
  if (normalized === "FULL_ADMIN") {
    return "bg-indigo-50 text-indigo-700 border-indigo-200/70 font-semibold";
  }
  if (normalized === "ADMIN") {
    return "bg-blue-50 text-blue-700 border-blue-200/70 font-semibold";
  }
  return "bg-slate-100 text-slate-700 border-slate-200 font-medium";
};

/**
 * Client-side safety filter ensuring no sensitive keys are rendered in UI.
 * @param {Object} obj
 * @returns {Object} Sanitized object
 */
export const sanitizeClientObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeClientObject);

  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEY_REGEX.test(key)) {
      clean[key] = "[REDACTED]";
    } else if (val && typeof val === "object") {
      clean[key] = sanitizeClientObject(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
};
