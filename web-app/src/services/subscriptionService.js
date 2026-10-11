import platformApi from "./api";

export const getSubscriptionPlans = async (params = {}) => {
  const response = await platformApi.get("/subscriptions/plans", { params });
  return response.data;
};

export const getSubscriptionStats = async () => {
  const response = await platformApi.get("/subscriptions/stats");
  return response.data;
};

export const getSubscribedCompanies = async (params = {}) => {
  const response = await platformApi.get("/subscriptions/subscribed-companies", { params });
  return response.data;
};

export const createSubscriptionPlan = async (planData) => {
  const response = await platformApi.post("/subscriptions/plans", planData);
  return response.data;
};

export const updateSubscriptionPlan = async (id, updateData) => {
  const response = await platformApi.put(`/subscriptions/plans/${id}`, updateData);
  return response.data;
};

export const publishSubscriptionPlan = async (id) => {
  const response = await platformApi.patch(`/subscriptions/plans/${id}/publish`);
  return response.data;
};

export const updateSubscriptionStatus = async (id, status) => {
  const response = await platformApi.patch(`/subscriptions/${id}/status`, { status });
  return response.data;
};

