import platformApi, { authApi } from "./api";

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

export const getMyVendorProfile = async () => {
  const response = await platformApi.get("/vendors/me");
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

export const getVendorStaff = async () => {
  const response = await platformApi.get("/vendors/me/staff");
  return response.data;
};

export const updateVendorStaffStatus = async (staffId, status) => {
  const response = await platformApi.patch(`/vendors/me/staff/${staffId}/status`, { status });
  return response.data;
};

export const updateVendorStaff = async (staffId, updateData) => {
  const response = await platformApi.put(`/vendors/me/staff/${staffId}`, updateData);
  return response.data;
};

export const createVendorStaff = async (staffData) => {
  const response = await authApi.post("/auth/users", {
    name: staffData.name,
    email: staffData.email,
    phone: staffData.phone,
    role: "STAFF",
  });

  const createdUser = response.data?.data || response.data;
  if (createdUser?._id && staffData.location) {
    try {
      await updateVendorStaff(createdUser._id, { location: staffData.location });
    } catch (locErr) {
      console.warn("Could not sync staff location:", locErr?.message || locErr);
    }
  }

  return response.data;
};

