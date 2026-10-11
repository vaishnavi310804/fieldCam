import {
  getAdminDashboardData,
  getSuperAdminDashboardData,
} from "./dashboard.service.js";

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

export const getSuperAdminDashboardStatsController = async (req, res) => {
  try {
    const result = await getSuperAdminDashboardData();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching Super Admin Dashboard stats:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch Super Admin Dashboard stats",
    });
  }
};
