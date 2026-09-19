import platformApi from "./api";

export const getVendors = async () => {
  const response = await platformApi.get("/vendors");
  return response.data;
};

export const getVendorStats = async () => {
  const response = await platformApi.get("/vendors/stats");
  return response.data;
};

export const getVendorById = async (id) => {
  const response = await platformApi.get(`/vendors/${id}`);
  return response.data;
};

export const createVendor = async (vendorData) => {
  const response = await platformApi.post("/vendors", vendorData);
  return response.data;
};

export const updateVendor = async (id, vendorData) => {
  const response = await platformApi.put(`/vendors/${id}`, vendorData);
  return response.data;
};

export const updateVendorStatus = async (id, status) => {
  const response = await platformApi.patch(`/vendors/${id}/status`, { status });
  return response.data;
};
