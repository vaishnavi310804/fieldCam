import AsyncStorage from "@react-native-async-storage/async-storage";
import { authClient, setAuthToken } from "./authClient";

export interface MobileLoginPayload {
  phone: string;
  password: string;
}

export interface FieldCamUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "VENDOR" | "STAFF" | "SUPER_ADMIN" | "ADMIN";
  companyId?: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  isVerified?: boolean;
  profileImage?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  location?: string | null;
  timezone?: string | null;
  title?: string | null;
  department?: string | null;
}

export interface LoginResponseData {
  user: FieldCamUser;
  accessToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const login = async (
  payload: MobileLoginPayload
): Promise<LoginResponseData> => {
  const response = await authClient.post<ApiResponse<LoginResponseData>>(
    "/mobile/login",
    payload
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Login failed");
  }

  const { user, accessToken } = response.data.data;
  await AsyncStorage.setItem("accessToken", accessToken);
  setAuthToken(accessToken);

  return { user, accessToken };
};

export const getCurrentUser = async (): Promise<FieldCamUser> => {
  const response = await authClient.get<ApiResponse<FieldCamUser>>("/me");

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch profile");
  }

  return response.data.data;
};

export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("accessToken");
  } catch {
    // Ignore error
  }
  setAuthToken(null);
};

export const authApi = {
  login,
  getCurrentUser,
  logout,
};

export default authApi;