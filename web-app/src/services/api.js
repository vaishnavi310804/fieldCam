import axios from "axios";

let onUnauthorizedCallback = null;
let isHandlingUnauthorized = false;

export const setOnUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

export const handleResponseError = (error) => {
  const status = error?.response?.status;
  const url = error?.config?.url || "";

  // 401 Unauthorized caused by invalid or expired token
  if (status === 401) {
    // Do not intercept login endpoint failures (e.g. invalid password during login)
    if (!url.includes("/auth/login")) {
      // Prevent multiple simultaneous 401 failures from triggering duplicate logout operations
      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;

        // Clear stored authentication state immediately
        localStorage.removeItem("fieldcam_access_token");
        localStorage.removeItem("fieldcam_user");

        // Notify AuthContext to update React state
        if (typeof onUnauthorizedCallback === "function") {
          try {
            onUnauthorizedCallback();
          } catch (e) {
            console.error("Error in onUnauthorizedCallback:", e);
          }
        }

        // Reset debounce guard after current batch of requests settles
        setTimeout(() => {
          isHandlingUnauthorized = false;
        }, 1000);
      }
    }
  }

  return Promise.reject(error);
};

export const authApi = axios.create({
  baseURL: "https://fieldcam-auth-service-bhzm.onrender.com/api",
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

authApi.interceptors.response.use(
  (response) => response,
  handleResponseError
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

platformApi.interceptors.response.use(
  (response) => response,
  handleResponseError
);

export default platformApi;

