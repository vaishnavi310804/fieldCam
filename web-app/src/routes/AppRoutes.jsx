import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import SuperAdminDashboard from "../pages/super-admin/Dashboard";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminProjects from "../pages/admin/Projects";
import CreateProject from "../pages/admin/CreateProject";
import AdminVendors from "../pages/admin/Vendors";
import AdminInvoices from "../pages/admin/Invoices";
import AdminAnalytics from "../pages/admin/Analytics";
import AdminServices from "../pages/admin/Services";
import AdminSupport from "../pages/admin/Support";
import VendorDashboard from "../pages/vendor/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Super Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/projects/new" element={<CreateProject />} />
        <Route path="/admin/vendors" element={<AdminVendors />} />
        <Route path="/admin/invoices" element={<AdminInvoices />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/support" element={<AdminSupport />} />
      </Route>

      {/* Vendor Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["VENDOR"]} />}>
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
