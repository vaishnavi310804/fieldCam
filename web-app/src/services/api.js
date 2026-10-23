import axios from "axios";

let onUnauthorizedCallback = null;
let isHandlingUnauthorized = false;

export const setOnUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

export const _resetUnauthorizedState = () => {
  isHandlingUnauthorized = false;
};

export const handleResponseError = (error) => {
  const status = error?.response?.status;
  const url = error?.config?.url || "";
  const errorCode = error?.response?.data?.code;
  const errorMessage = error?.response?.data?.message || "";

  const isCompanySuspended =
    status === 403 &&
    (errorCode === "COMPANY_SUSPENDED" ||
      errorMessage.toLowerCase().includes("company has been suspended") ||
      errorMessage.toLowerCase().includes("company account has been suspended") ||
      errorMessage.toLowerCase().includes("company account is suspended"));

  const isAccountInactive =
    status === 403 &&
    (errorCode === "ACCOUNT_INACTIVE" ||
      errorMessage.toLowerCase().includes("account is not active") ||
      errorMessage.toLowerCase().includes("account is inactive") ||
      errorMessage.toLowerCase().includes("account has been deactivated"));

  const shouldTerminateSession =
    status === 401 || isCompanySuspended || isAccountInactive;

  // 401 Unauthorized or 403 Company Suspended / Account Inactive
  if (shouldTerminateSession) {
    // Do not intercept login endpoint failures (e.g. invalid password during login)
    if (!url.includes("/auth/login") && !url.includes("/auth/mobile/login")) {
      // Prevent multiple simultaneous failures from triggering duplicate logout operations
      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;

        if (isCompanySuspended || isAccountInactive) {
          try {
            sessionStorage.setItem(
              "fieldcam_suspension_message",
              errorMessage ||
                (isAccountInactive
                  ? "Account is not active. Please contact administrator"
                  : "Your company has been suspended. Access has been disabled.")
            );
          } catch {
            // Non-blocking
          }
        }

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

        // Ensure navigation to login even if outside React Router tree
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          setTimeout(() => {
            if (window.location.pathname !== "/login") {
              window.location.replace("/login");
            }
          }, 50);
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

