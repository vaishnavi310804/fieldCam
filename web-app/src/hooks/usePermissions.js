import { useAuth } from "../context/AuthContext";

/**
 * Custom hook to evaluate user permissions and role details.
 * Derives state directly from the authenticated user in AuthContext.
 *
 * @returns {Object} {
 *   can: (module: string, action: string) => boolean,
 *   canAccessModule: (module: string) => boolean,
 *   isSuperAdmin: boolean,
 *   permissions: Array,
 *   roleDetails: Object|null,
 *   role: string|null,
 *   loading: boolean,
 *   isAuthenticated: boolean
 * }
 */
export function usePermissions() {
  const {
    can,
    canAccessModule,
    isSuperAdmin,
    roleDetails,
    permissions,
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  return {
    can,
    canAccessModule,
    isSuperAdmin,
    roleDetails: roleDetails || null,
    permissions: Array.isArray(permissions) ? permissions : [],
    role: user?.role || null,
    loading,
    isAuthenticated,
  };
}

export default usePermissions;
