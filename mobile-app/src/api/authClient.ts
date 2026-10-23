import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// eslint-disable-next-line import/no-named-as-default-member
export const authClient = axios.create({
  baseURL: "https://fieldcam-auth-service-bhzm.onrender.com/api",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (cb: (() => void) | null) => {
  onUnauthorizedCallback = cb;
};

export const triggerUnauthorized = async (suspensionMessage?: string) => {
  try {
    await AsyncStorage.removeItem("accessToken");
    if (suspensionMessage) {
      await AsyncStorage.setItem("fieldcam_suspension_message", suspensionMessage);
    }
    setAuthToken(null);
  } catch (e) {
    console.error("Error clearing token from AsyncStorage:", e);
  }

  if (typeof onUnauthorizedCallback === "function") {
    try {
      onUnauthorizedCallback();
    } catch (cbErr) {
      console.error("Error in onUnauthorizedCallback:", cbErr);
    }
  }
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    const cleanToken = token.replace(/^"|"$/g, "").trim();

    authClient.defaults.headers.common["Authorization"] =
      `Bearer ${cleanToken}`;
  } else {
    delete authClient.defaults.headers.common["Authorization"];
  }
};

authClient.interceptors.request.use(async (config) => {
  try {
    if (!config.headers.Authorization && !config.headers.authorization) {
      const token = await AsyncStorage.getItem("accessToken");

      if (token) {
        const cleanToken = token.replace(/^"|"$/g, "").trim();
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
    }
  } catch (error) {
    console.error("Error reading token from AsyncStorage:", error);
  }

  return config;
});

authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.code;
    const errorMessage = error.response?.data?.message || "";
    const url = error.config?.url || "";

    const isSuspendedOrInactive =
      status === 403 &&
      (errorCode === "COMPANY_SUSPENDED" ||
        errorCode === "ACCOUNT_INACTIVE" ||
        errorMessage.toLowerCase().includes("company has been suspended") ||
        errorMessage.toLowerCase().includes("company account has been suspended") ||
        errorMessage.toLowerCase().includes("company account is suspended") ||
        errorMessage.toLowerCase().includes("account is not active") ||
        errorMessage.toLowerCase().includes("account is inactive") ||
        errorMessage.toLowerCase().includes("account has been deactivated"));

    // Exclude login endpoints from logout interceptor
    if (
      (status === 401 || isSuspendedOrInactive) &&
      !url.includes("/auth/mobile/login") &&
      !url.includes("/auth/login")
    ) {
      await triggerUnauthorized(
        isSuspendedOrInactive
          ? errorMessage || "Account is not active or company suspended. Please contact administrator."
          : undefined
      );
    }

    return Promise.reject(error);
  }
);