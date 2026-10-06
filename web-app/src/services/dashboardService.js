import platformApi from "./api";

/**
 * Fetches admin dashboard stats & aggregated metrics from GET /api/dashboard/stats
 * @returns {Promise<Object>} API response payload { success: true, data: { kpis, monthlyEarnings, vendorPerformance, recentActivity, recentSubmissions, expensesAvailable } }
 */
export const getAdminDashboardStats = async () => {
  const response = await platformApi.get("/dashboard/stats");
  return response.data;
};

/**
 * Fetches super admin dashboard telemetry metrics from GET /api/dashboard/super-admin/stats
 * @returns {Promise<Object>} API response payload { success: true, data: { metrics, growthTrends, topOrganizations, regionalAvailability } }
 */
export const getSuperAdminDashboardStats = async () => {
  const response = await platformApi.get("/dashboard/super-admin/stats");
  return response.data;
};
