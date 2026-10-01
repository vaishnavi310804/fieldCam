import platformApi from "./api";

/**
 * Fetches admin dashboard stats & aggregated metrics from GET /api/dashboard/stats
 * @returns {Promise<Object>} API response payload { success: true, data: { kpis, monthlyEarnings, vendorPerformance, recentActivity, recentSubmissions, expensesAvailable } }
 */
export const getAdminDashboardStats = async () => {
  const response = await platformApi.get("/dashboard/stats");
  return response.data;
};
