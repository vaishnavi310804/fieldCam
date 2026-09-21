import { authApi } from "./api";

export const loginUser = async (credentials) => {
  const response = await authApi.post("/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });
  return response;
};

export const getProfile = async () => {
  const response = await authApi.get("/auth/me");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await authApi.put("/auth/me", profileData);
  return response.data;
};
