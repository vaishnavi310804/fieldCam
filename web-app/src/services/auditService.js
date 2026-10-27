import platformApi from "./api.js";

/**
 * Fetch current user's personal audit logs (used by Admin /admin/activity)
 */
export const getMyAuditLogs = async (params = {}) => {
  const response = await platformApi.get("/audit-logs/me", { params });
  return response.data;
};

/**
 * Fetch global administrative audit logs with pagination, search, and filters.
 * Restricted to Super Admins.
 */
export const getAuditLogs = async (params = {}) => {
  const response = await platformApi.get("/audit-logs", { params });
  return response.data;
};

/**
 * Fetch single audit log entry by ID.
 * Restricted to Super Admins.
 */
export const getAuditLogById = async (id) => {
  const response = await platformApi.get(`/audit-logs/${id}`);
  return response.data;
};
