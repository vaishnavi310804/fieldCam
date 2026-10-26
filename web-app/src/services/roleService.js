import platformApi from "./api.js";

/**
 * Service client for Roles & Access backend APIs.
 * Connects to /api/roles via configured platformApi client.
 */

export const getRoles = async (params = {}) => {
  const response = await platformApi.get("/roles", { params });
  return response.data;
};

export const getRoleById = async (id) => {
  const response = await platformApi.get(`/roles/${id}`);
  return response.data;
};

export const createRole = async (roleData) => {
  const response = await platformApi.post("/roles", roleData);
  return response.data;
};

export const updateRole = async (id, roleData) => {
  const response = await platformApi.put(`/roles/${id}`, roleData);
  return response.data;
};

export const deleteRole = async (id) => {
  const response = await platformApi.delete(`/roles/${id}`);
  return response.data;
};

export default {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
