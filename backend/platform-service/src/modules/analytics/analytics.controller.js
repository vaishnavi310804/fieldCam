import { getAdminAnalyticsData } from "./analytics.service.js";

export const getAdminAnalyticsController = async (req, res) => {
  try {
    const result = await getAdminAnalyticsData();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching Admin Analytics data:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Admin Analytics data",
    });
  }
};
