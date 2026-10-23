import platformApi from "./api";

export const getProjects = async () => {
  const response = await platformApi.get("/projects");
  return response.data;
};

export const getProjectById = async (id) => {
  const response = await platformApi.get(`/projects/${id}`);
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await platformApi.post("/projects", projectData);
  return response.data;
};

export const updateProject = async (id, projectData) => {
  const response = await platformApi.put(`/projects/${id}`, projectData);
  return response.data;
};

export const updateProjectStatus = async (
  id,
  status,
  rejectionReason,
  reviewComments,
  notifyVendor = true
) => {
  const payload = { status };
  if (rejectionReason) payload.rejectionReason = rejectionReason;
  if (reviewComments) payload.reviewComments = reviewComments;
  if (typeof notifyVendor === "boolean") payload.notifyVendor = notifyVendor;
  const response = await platformApi.patch(`/projects/${id}/status`, payload);
  return response.data;
};

export const getProjectHistory = async (projectId) => {
  const response = await platformApi.get(
    `/audit-logs/entity/Project/${projectId}`
  );
  return response.data;
};

export const getStaffProjects = async () => {
  const response = await platformApi.get("/projects/staff/me");
  return response.data;
};

export const getProjectNotes = async (projectId) => {
  const response = await platformApi.get(`/projects/${projectId}/notes`);
  return response.data;
};

export const addProjectNote = async (projectId, text) => {
  const response = await platformApi.post(`/projects/${projectId}/notes`, { text });
  return response.data;
};

export const assignStaffToProject = async (projectId, staffId) => {
  const response = await platformApi.post(`/projects/${projectId}/assign-staff`, { staffId });
  return response.data;
};

export const acceptProject = async (projectId) => {
  const response = await platformApi.patch(`/projects/${projectId}/accept`);
  return response.data;
};


