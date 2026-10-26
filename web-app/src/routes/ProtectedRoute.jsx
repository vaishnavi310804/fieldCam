import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { FiLoader, FiAlertTriangle } from "react-icons/fi";

export const AccessDenied = ({ message = "You do not have permission to access this page." }) => (
  <div className="min-h-screen bg-[#FAF7F5] flex flex-col items-center justify-center p-6 text-center">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#E8E2DE] p-8 space-y-4">
      <div className="w-12 h-12 bg-[#FEE2E2] text-[#DC2626] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
        <FiAlertTriangle />
      </div>
      <h2 className="text-lg font-bold text-[#3E3734]">Access Restricted</h2>
      <p className="text-xs text-[#817B77] leading-relaxed">
        {message}
      </p>
      <button
        type="button"
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-[#C8B5AC] hover:bg-[#B39D93] text-[#3E3734] font-semibold text-xs rounded-xl transition-all"
      >
        Go Back
      </button>
    </div>
  </div>
);

const ProtectedRoute = ({ allowedRoles, requiredModule, requiredPermission }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const { can, canAccessModule } = usePermissions();

  // 1. If authentication resolution is still in flight, render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] flex flex-col items-center justify-center text-[#817B77] space-y-3">
        <FiLoader className="animate-spin text-3xl text-[#8A817C]" />
        <p className="text-xs font-semibold">Verifying session...</p>
      </div>
    );
  }

  // 2. If unauthenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. If role is not allowed, preserve existing authorization denial behavior
  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    switch (user?.role) {
      case "SUPER_ADMIN":
        return <Navigate to="/super-admin/dashboard" replace />;
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "VENDOR":
        return <Navigate to="/vendor/dashboard" replace />;
      case "STAFF":
        return <Navigate to="/staff/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // 4. Module-level permission check
  if (requiredModule) {
    if (!canAccessModule(requiredModule)) {
      return (
        <AccessDenied
          message={`You do not have permission to access the ${requiredModule} module.`}
        />
      );
    }
  }

  // 5. Action-level permission check
  if (requiredPermission) {
    let mod = null;
    let act = null;
    if (typeof requiredPermission === "string") {
      const parts = requiredPermission.split(":");
      mod = parts[0];
      act = parts[1];
    } else if (typeof requiredPermission === "object") {
      mod = requiredPermission.module;
      act = requiredPermission.action;
    }

    if (!can(mod, act)) {
      return (
        <AccessDenied
          message={`You do not have permission to perform ${act} on ${mod}.`}
        />
      );
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;

