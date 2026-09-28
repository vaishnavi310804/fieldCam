import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, FieldCamUser, MobileLoginPayload } from "../api/auth.api";
import { setAuthToken } from "../api/authClient";

interface AuthContextType {
  user: FieldCamUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: MobileLoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<FieldCamUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        setAuthToken(token);
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch {
      await AsyncStorage.removeItem("accessToken").catch(() => {});
      setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: MobileLoginPayload) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
