import platformApi from "./api";

export const getAdminAnalyticsData = async () => {
  const response = await platformApi.get("/analytics/admin");
  return response.data;
};
