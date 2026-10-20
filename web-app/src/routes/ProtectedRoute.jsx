import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiLoader } from "react-icons/fi";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

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

  return <Outlet />;
};

export default ProtectedRoute;

