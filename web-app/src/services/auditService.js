import platformApi from "./api";

/**
 * Fetches audit logs for the authenticated user from GET /api/audit-logs/me
 * @param {Object} [params] - Optional query parameters (page, limit)
 * @returns {Promise<Object>} API response payload { success, count, data, pagination }
 */
export const getMyAuditLogs = async (params = {}) => {
  const response = await platformApi.get("/audit-logs/me", { params });
  return response.data;
};
