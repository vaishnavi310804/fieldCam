import platformApi from "./api";

/**
 * Retrieves subscription plans from backend.
 * GET /api/subscriptions/plans
 */
export const getSubscriptionPlans = async (params = {}) => {
  const response = await platformApi.get("/subscriptions/plans", { params });
  return response.data;
};

/**
 * Retrieves subscription stats from backend.
 * GET /api/subscriptions/stats
 */
export const getSubscriptionStats = async () => {
  const response = await platformApi.get("/subscriptions/stats");
  return response.data;
};

/**
 * Retrieves paginated list of subscribed companies.
 * GET /api/subscriptions/subscribed-companies
 */
export const getSubscribedCompanies = async (params = {}) => {
  const response = await platformApi.get("/subscriptions/subscribed-companies", { params });
  return response.data;
};

/**
 * Creates a new subscription plan (DRAFT or PUBLISHED).
 * POST /api/subscriptions/plans
 */
export const createSubscriptionPlan = async (planData) => {
  const response = await platformApi.post("/subscriptions/plans", planData);
  return response.data;
};

/**
 * Updates an existing subscription plan.
 * PUT /api/subscriptions/plans/:id
 */
export const updateSubscriptionPlan = async (id, updateData) => {
  const response = await platformApi.put(`/subscriptions/plans/${id}`, updateData);
  return response.data;
};

/**
 * Publishes a draft subscription plan.
 * PATCH /api/subscriptions/plans/:id/publish
 */
export const publishSubscriptionPlan = async (id) => {
  const response = await platformApi.patch(`/subscriptions/plans/${id}/publish`);
  return response.data;
};

/**
 * Updates subscription status of a company (Active, Past Due, Cancelled, Trial).
 * PATCH /api/subscriptions/:id/status
 */
export const updateSubscriptionStatus = async (id, status) => {
  const response = await platformApi.patch(`/subscriptions/${id}/status`, { status });
  return response.data;
};
