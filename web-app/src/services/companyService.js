import platformApi from "./api";

export const getCompanies = async (params = {}) => {
  const response = await platformApi.get("/vendors", { params });
  return response.data;
};

export const getCompanyStats = async () => {
  const response = await platformApi.get("/vendors/stats");
  return response.data;
};

export const createCompany = async (companyData) => {
  const response = await platformApi.post("/vendors", companyData);
  return response.data;
};

export const updateCompanyStatus = async (id, status) => {
  const response = await platformApi.patch(`/vendors/${id}/status`, { status });
  return response.data;
};

export const updateCompany = async (id, updateData) => {
  const response = await platformApi.put(`/vendors/${id}`, updateData);
  return response.data;
};

