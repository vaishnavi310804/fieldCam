import api from "./api";

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/web/login", {
    email: credentials.email,
    password: credentials.password,
  });
  return response;
};
