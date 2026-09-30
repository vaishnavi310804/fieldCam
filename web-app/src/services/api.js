import axios from "axios";

export const authApi = axios.create({
  baseURL:"https://fieldcam-auth-service-bhzm.onrender.com/api",
});

authApi.interceptors.request.use(
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

export const platformApi = axios.create({
  baseURL: "https://fieldcam-platform-service.onrender.com/api",
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
