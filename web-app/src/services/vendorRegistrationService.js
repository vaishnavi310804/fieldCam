import platformApi from "./api";

/**
 * Submits a prospective vendor registration request from the public login screen.
 */
export const submitVendorRegistration = async (registrationData) => {
  const response = await platformApi.post("/vendor-registrations", registrationData);
  return response.data;
};

/**
 * Lists vendor registration requests with optional status filtering, search, and pagination.
 * Admin-only operation.
 */
export const getVendorRegistrations = async (params = {}) => {
  const response = await platformApi.get("/vendor-registrations", { params });
  return response.data;
};

/**
 * Gets a single vendor registration request by ID.
 * Admin-only operation.
 */
export const getVendorRegistrationById = async (id) => {
  const response = await platformApi.get(`/vendor-registrations/${id}`);
  return response.data;
};

/**
 * Approves a pending vendor registration request.
 * Reuses existing Admin vendor provisioning and sends invitation OTP email.
 * Admin-only operation.
 */
export const approveVendorRegistration = async (id, payload = {}) => {
  const response = await platformApi.post(`/vendor-registrations/${id}/approve`, payload);
  return response.data;
};

/**
 * Rejects a pending vendor registration request with an optional reason.
 * Dispatches a rejection notification email to applicant.
 * Admin-only operation.
 */
export const rejectVendorRegistration = async (id, payload = {}) => {
  const response = await platformApi.post(`/vendor-registrations/${id}/reject`, payload);
  return response.data;
};
