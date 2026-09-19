import platformApi from "./api";

export const getServices = async (params) => {
  const response = await platformApi.get("/services", { params });
  return response.data;
};

export const getServiceById = async (id) => {
  const response = await platformApi.get(`/services/${id}`);
  return response.data;
};

export const createService = async (serviceData) => {
  const response = await platformApi.post("/services", serviceData);
  return response.data;
};

export const updateService = async (id, serviceData) => {
  const response = await platformApi.put(`/services/${id}`, serviceData);
  return response.data;
};

export const updateServiceStatus = async (id, status) => {
  const response = await platformApi.patch(`/services/${id}/status`, { status });
  return response.data;
};
