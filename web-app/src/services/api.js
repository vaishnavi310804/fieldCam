import axios from "axios";

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || "http://localhost:5000/api",
});

export const platformApi = axios.create({
  baseURL: import.meta.env.VITE_PLATFORM_API_URL || "http://localhost:5001/api",
});

platformApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fieldcam_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default platformApi;
