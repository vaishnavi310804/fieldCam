import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { triggerUnauthorized } from "./authClient";

// eslint-disable-next-line import/no-named-as-default-member
export const platformClient = axios.create({
  baseURL: "https://fieldcam-platform-service.onrender.com/api",
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

platformClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");

    if (token) {
      const cleanToken = token.replace(/^"|"$/g, "").trim();
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
  } catch (error) {
    console.error("Error reading token from AsyncStorage:", error);
  }

  return config;
});

platformClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.code;
    const errorMessage = error.response?.data?.message || "";

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

    if (status === 401 || isSuspendedOrInactive) {
      await triggerUnauthorized(
        isSuspendedOrInactive
          ? errorMessage || "Account is not active or company suspended. Please contact administrator."
          : undefined
      );
    }

    return Promise.reject(error);
  }
);