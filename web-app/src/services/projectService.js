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

export const updateProjectStatus = async (id, status, rejectionReason) => {
  const payload = { status };
  if (rejectionReason) payload.rejectionReason = rejectionReason;
  const response = await platformApi.patch(`/projects/${id}/status`, payload);
  return response.data;
};
