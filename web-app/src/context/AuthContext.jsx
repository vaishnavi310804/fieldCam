import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("fieldcam_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("fieldcam_access_token") || null;
  });

  const login = (userData, accessToken) => {
    localStorage.setItem("fieldcam_user", JSON.stringify(userData));
    localStorage.setItem("fieldcam_access_token", accessToken);

    setUser(userData);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem("fieldcam_user");
    localStorage.removeItem("fieldcam_access_token");

    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export const useAuth = () => useContext(AuthContext);