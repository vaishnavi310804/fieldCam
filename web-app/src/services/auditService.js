import platformApi from "./api";

export const getMyAuditLogs = async (params = {}) => {
  const response = await platformApi.get("/audit-logs/me", { params });
  return response.data;
};

