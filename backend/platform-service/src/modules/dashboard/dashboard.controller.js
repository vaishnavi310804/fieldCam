import { getAdminDashboardData } from "./dashboard.service.js";

/**
 * Controller to handle fetching real Admin Dashboard metrics and datasets.
 * GET /api/dashboard/stats
 */
export const getAdminDashboardStatsController = async (req, res) => {
  try {
    const result = await getAdminDashboardData();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching Admin Dashboard stats:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch Admin Dashboard stats",
    });
  }
};
