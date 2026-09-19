import { authApi } from "./api";

export const loginUser = async (credentials) => {
  const response = await authApi.post("/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });
  return response;
};
