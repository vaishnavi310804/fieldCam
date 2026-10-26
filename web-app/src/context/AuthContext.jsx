import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { getProfile } from "../services/authService";
import { setOnUnauthorizedCallback } from "../services/api";
import {
  normalizePermissions,
  checkIsSuperAdmin,
  checkPermission,
  checkModuleAccess,
} from "../utils/permissions";

const AuthContext = createContext();

export const isTokenExpired = (token) => {
  if (!token || typeof token !== "string") return true;
  const parts = token.split(".");
  if (parts.length !== 3) return true;
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    if (!decoded.exp) return false;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

const getInitialSession = () => {
  try {
    const savedToken = localStorage.getItem("fieldcam_access_token");
    const savedUserStr = localStorage.getItem("fieldcam_user");

    // If either token or user is missing, clear any inconsistent storage state
    if (!savedToken || !savedUserStr) {
      localStorage.removeItem("fieldcam_access_token");
      localStorage.removeItem("fieldcam_user");
      return { token: null, user: null };
    }

    // If token is already expired client-side, clear storage immediately
    if (isTokenExpired(savedToken)) {
      localStorage.removeItem("fieldcam_access_token");
      localStorage.removeItem("fieldcam_user");
      return { token: null, user: null };
    }

    const savedUser = JSON.parse(savedUserStr);
    return { token: savedToken, user: savedUser };
  } catch {
    localStorage.removeItem("fieldcam_access_token");
    localStorage.removeItem("fieldcam_user");
    return { token: null, user: null };
  }
};

export function AuthProvider({ children }) {
  const initialSession = getInitialSession();

  const [user, setUser] = useState(initialSession.user);
  const [token, setToken] = useState(initialSession.token);
  // Only loading if we have a stored unexpired token that needs backend verification
  const [loading, setLoading] = useState(() => !!initialSession.token);

  const logout = useCallback(() => {
    localStorage.removeItem("fieldcam_user");
    localStorage.removeItem("fieldcam_access_token");

    setUser(null);
    setToken(null);
    setLoading(false);
  }, []);

  const login = (userData, accessToken) => {
    localStorage.setItem("fieldcam_user", JSON.stringify(userData));
    localStorage.setItem("fieldcam_access_token", accessToken);

    setUser(userData);
    setToken(accessToken);
    setLoading(false);
  };

  const updateUser = (updatedUser) => {
    if (!updatedUser) return;
    localStorage.setItem("fieldcam_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Connect Axios 401 interceptor to AuthContext logout
  useEffect(() => {
    setOnUnauthorizedCallback(logout);
    return () => {
      setOnUnauthorizedCallback(null);
    };
  }, [logout]);

  // Validate stored session on application startup
  useEffect(() => {
    let isMounted = true;

    const validateStoredSession = async () => {
      const activeToken = localStorage.getItem("fieldcam_access_token");
      if (!activeToken) {
        if (isMounted) setLoading(false);
        return;
      }

      if (isTokenExpired(activeToken)) {
        logout();
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await getProfile();

        // Prevent race conditions: check if token was cleared or changed while in-flight
        const currentToken = localStorage.getItem("fieldcam_access_token");
        if (!currentToken || currentToken !== activeToken) {
          return;
        }

        if (isMounted) {
          if (response?.data) {
            updateUser(response.data);
          }
          setLoading(false);
        }
      } catch (err) {
        // Prevent race conditions
        const currentToken = localStorage.getItem("fieldcam_access_token");
        if (!currentToken || currentToken !== activeToken) {
          return;
        }

        if (isMounted) {
          const status = err.response?.status;
          const errorCode = err.response?.data?.code;
          const errorMessage = err.response?.data?.message || "";
          const isSuspendedOrInactive =
            status === 401 ||
            (status === 403 &&
              (errorCode === "ACCOUNT_INACTIVE" ||
                errorCode === "COMPANY_SUSPENDED" ||
                errorMessage.toLowerCase().includes("account is not active") ||
                errorMessage.toLowerCase().includes("company has been suspended")));

          if (isSuspendedOrInactive) {
            logout();
          } else {
            // Unrelated network failure (offline/timeout) or 5xx: preserve session
            console.warn("Session validation warning:", err.message);
          }
          setLoading(false);
        }
      }
    };

    validateStoredSession();

    return () => {
      isMounted = false;
    };
  }, [logout]);

  const isAuthenticated = !loading && !!token && !!user;

  // Derive permissions directly from the authenticated user
  const permissionMap = useMemo(() => {
    return normalizePermissions(user?.permissions);
  }, [user?.permissions]);

  const isSuperAdmin = useMemo(() => {
    return checkIsSuperAdmin(user);
  }, [user]);

  const can = useCallback(
    (module, action) => {
      return checkPermission(user, permissionMap, module, action);
    },
    [user, permissionMap]
  );

  const canAccessModule = useCallback(
    (module) => {
      return checkModuleAccess(user, permissionMap, module);
    },
    [user, permissionMap]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated,
        // RBAC Permissions helpers & metadata
        can,
        canAccessModule,
        isSuperAdmin,
        roleDetails: user?.roleDetails || null,
        permissions: Array.isArray(user?.permissions) ? user.permissions : [],
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
