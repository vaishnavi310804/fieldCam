import platformApi from "./api.js";

/**
 * Service client for Admin Users backend APIs.
 * Connects to /api/admin-users via configured platformApi client.
 */

export const getAdminUsers = async (params = {}) => {
  const response = await platformApi.get("/admin-users", { params });
  return response.data;
};

export const inviteAdminUser = async (adminData) => {
  const response = await platformApi.post("/admin-users", adminData);
  return response.data;
};

export const reassignAdminRole = async (id, roleId) => {
  const response = await platformApi.patch(`/admin-users/${id}/role`, {
    roleId,
  });
  return response.data;
};

export const updateAdminStatus = async (id, status) => {
  const response = await platformApi.patch(`/admin-users/${id}/status`, {
    status,
  });
  return response.data;
};

export default {
  getAdminUsers,
  inviteAdminUser,
  reassignAdminRole,
  updateAdminStatus,
};
