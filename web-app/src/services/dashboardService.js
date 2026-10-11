import platformApi from "./api";

export const getAdminDashboardStats = async () => {
  const response = await platformApi.get("/dashboard/stats");
  return response.data;
};

export const getSuperAdminDashboardStats = async () => {
  const response = await platformApi.get("/dashboard/super-admin/stats");
  return response.data;
};

