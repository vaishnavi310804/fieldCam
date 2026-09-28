import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// eslint-disable-next-line import/no-named-as-default-member
export const platformClient = axios.create({
  baseURL: "http://10.0.2.2:5001/api",
  timeout: 10000,
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
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem("accessToken");
      } catch {
        console.error("Error removing token from AsyncStorage:", error);
      }
    }

    return Promise.reject(error);
  }
);