import platformApi from "./api";

/**
 * Retrieves paginated/filtered list of client companies/organizations.
 * GET /api/vendors
 */
export const getCompanies = async (params = {}) => {
  const response = await platformApi.get("/vendors", { params });
  return response.data;
};

/**
 * Retrieves summary statistics for company organizations.
 * GET /api/vendors/stats
 */
export const getCompanyStats = async () => {
  const response = await platformApi.get("/vendors/stats");
  return response.data;
};

/**
 * Provisions a new company/vendor organization.
 * POST /api/vendors
 */
export const createCompany = async (companyData) => {
  const response = await platformApi.post("/vendors", companyData);
  return response.data;
};

/**
 * Updates status of a company organization (Active, Suspended, Inactive).
 * PATCH /api/vendors/:id/status
 */
export const updateCompanyStatus = async (id, status) => {
  const response = await platformApi.patch(`/vendors/${id}/status`, { status });
  return response.data;
};

/**
 * Updates details of a company organization.
 * PUT /api/vendors/:id
 */
export const updateCompany = async (id, updateData) => {
  const response = await platformApi.put(`/vendors/${id}`, updateData);
  return response.data;
};
