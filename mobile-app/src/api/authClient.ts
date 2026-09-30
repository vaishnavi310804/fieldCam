import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const authClient = axios.create({
  baseURL: "https://fieldcam-auth-service-bhzm.onrender.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem("accessToken");
        setAuthToken(null);
      } catch {
        console.error("Error removing token from AsyncStorage:", error);
      }
    }

    return Promise.reject(error);
  }
);