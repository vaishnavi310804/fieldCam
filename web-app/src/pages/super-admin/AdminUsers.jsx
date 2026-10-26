import { useState, useEffect, useCallback, useMemo } from "react";
import SuperAdminSidebar from "../../components/super-admin/SuperAdminSidebar";
import SuperAdminHeader from "../../components/super-admin/SuperAdminHeader";
import SuperAdminMetricCard from "../../components/super-admin/SuperAdminMetricCard";
import AdminUsersTable from "../../components/super-admin/AdminUsersTable";
import InviteAdminModal from "../../components/super-admin/InviteAdminModal";
import ReassignAdminRoleModal from "../../components/super-admin/ReassignAdminRoleModal";
import ChangeAdminStatusModal from "../../components/super-admin/ChangeAdminStatusModal";
import { getAdminUsers } from "../../services/adminUserService.js";
import { useAuth } from "../../context/AuthContext";
import {
  FiPlus,
  FiUsers,
  FiUserCheck,
  FiClock,
  FiAlertTriangle,
  FiRefreshCw,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const AdminUsers = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL", "ACTIVE", "INACTIVE", "SUSPENDED"

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 15;
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: limit,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  // Modal states
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Fetch administrator accounts from API
  const fetchAdminUsersList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (statusFilter && statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const res = await getAdminUsers(params);
      if (res?.success && Array.isArray(res?.data)) {
        setUsers(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        } else {
          setPagination({
            totalRecords: res.data.length,
            totalPages: Math.ceil(res.data.length / limit) || 1,
            currentPage: page,
            pageSize: limit,
          });
        }
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to load admin users:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load administrator accounts from the platform server."
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, statusFilter]);

  // Initial and reactive load
  useEffect(() => {
    fetchAdminUsersList();
  }, [fetchAdminUsersList]);

  // Summary telemetry calculations for the loaded dataset
  const stats = useMemo(() => {
    const total = pagination.totalRecords || users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const pending = users.filter((u) => u.status === "INACTIVE" && !u.isVerified).length;
    const suspended = users.filter((u) => u.status === "SUSPENDED").length;

    return { total, active, pending, suspended };
  }, [users, pagination.totalRecords]);

  // Modal trigger handlers
  const handleOpenInvite = () => {
    setIsInviteOpen(true);
  };

  const handleOpenReassign = (admin) => {
    setSelectedAdmin(admin);
    setIsReassignOpen(true);
  };

  const handleOpenStatus = (admin) => {
    setSelectedAdmin(admin);
    setIsStatusOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex text-[#2D3436]">
      {/* Sidebar */}
      <SuperAdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[220px]"
        }`}
      >
        {/* Header */}
        <SuperAdminHeader
          searchQuery={searchQuery}
          setSearchQuery={(val) => {
            setSearchQuery(val);
            setPage(1); // reset to page 1 on search
          }}
        />

        {/* Content Body */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Top Page Heading & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#2D3436] tracking-tight">
                Admin Users
              </h1>
              <p className="text-xs md:text-sm text-[#817B77] mt-1 font-medium">
                Manage administrator accounts, assigned roles, and account access.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleOpenInvite}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#817B77] hover:bg-[#6E6763] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                <FiPlus className="text-sm" />
                <span>Add Admin</span>
              </button>

              {error && (
                <button
                  type="button"
                  onClick={fetchAdminUsersList}
                  className="p-2.5 bg-white border border-[#EBE6E3] text-[#6E6763] hover:text-[#2D3436] rounded-xl transition cursor-pointer"
                  title="Retry loading administrators"
                >
                  <FiRefreshCw className="text-sm" />
                </button>
              )}
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={fetchAdminUsersList}
                className="underline hover:text-red-900 font-bold ml-4 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <SuperAdminMetricCard
              title="Total Administrators"
              value={`${stats.total}`}
              change={null}
              isAvailable={true}
              icon={FiUsers}
              iconBg="bg-indigo-50 text-indigo-600 border border-indigo-100"
            />

            <SuperAdminMetricCard
              title="Active Accounts"
              value={`${stats.active}`}
              change={null}
              isAvailable={true}
              icon={FiUserCheck}
              iconBg="bg-emerald-50 text-emerald-600 border border-emerald-100"
            />

            <SuperAdminMetricCard
              title="Pending Activation"
              value={`${stats.pending}`}
              change={null}
              isAvailable={true}
              icon={FiClock}
              iconBg="bg-amber-50 text-amber-600 border border-amber-100"
            />

            <SuperAdminMetricCard
              title="Suspended Accounts"
              value={`${stats.suspended}`}
              change={null}
              isAvailable={true}
              icon={FiAlertTriangle}
              iconBg="bg-rose-50 text-rose-600 border border-rose-100"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-[#EBE6E3] rounded-xl shadow-2xs overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  statusFilter === "ALL"
                    ? "bg-[#817B77] text-white shadow-xs"
                    : "text-[#6E6763] hover:text-[#2D3436] hover:bg-[#FAF7F5]"
                }`}
              >
                All Accounts
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ACTIVE");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  statusFilter === "ACTIVE"
                    ? "bg-[#817B77] text-white shadow-xs"
                    : "text-[#6E6763] hover:text-[#2D3436] hover:bg-[#FAF7F5]"
                }`}
              >
                Active
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter("INACTIVE");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  statusFilter === "INACTIVE"
                    ? "bg-[#817B77] text-white shadow-xs"
                    : "text-[#6E6763] hover:text-[#2D3436] hover:bg-[#FAF7F5]"
                }`}
              >
                Inactive
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter("SUSPENDED");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  statusFilter === "SUSPENDED"
                    ? "bg-[#817B77] text-white shadow-xs"
                    : "text-[#6E6763] hover:text-[#2D3436] hover:bg-[#FAF7F5]"
                }`}
              >
                Suspended
              </button>
            </div>

            {/* In-table Search Bar */}
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email, or phone..."
                className="w-full h-9 pl-9 pr-3 bg-white border border-[#EBE6E3] rounded-xl text-xs text-[#2D3436] placeholder:text-[#A39A94] focus:border-[#5141F5] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Admin Users Table */}
          <AdminUsersTable
            users={users}
            loading={loading}
            onReassignRole={handleOpenReassign}
            onChangeStatus={handleOpenStatus}
          />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-[#817B77]">
              <span>
                Showing Page <strong>{pagination.currentPage}</strong> of{" "}
                <strong>{pagination.totalPages}</strong> ({pagination.totalRecords} total administrators)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.currentPage <= 1 || loading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#EBE6E3] rounded-lg text-xs font-medium text-[#2D3436] hover:bg-[#FAF7F5] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <FiChevronLeft className="text-sm" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPage((prev) => Math.min(pagination.totalPages, prev + 1))
                  }
                  disabled={pagination.currentPage >= pagination.totalPages || loading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#EBE6E3] rounded-lg text-xs font-medium text-[#2D3436] hover:bg-[#FAF7F5] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <span>Next</span>
                  <FiChevronRight className="text-sm" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Invite Admin Modal */}
      <InviteAdminModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={fetchAdminUsersList}
      />

      {/* Reassign Admin Role Modal */}
      <ReassignAdminRoleModal
        isOpen={isReassignOpen}
        onClose={() => {
          setIsReassignOpen(false);
          setSelectedAdmin(null);
        }}
        onSuccess={fetchAdminUsersList}
        admin={selectedAdmin}
      />

      {/* Change Admin Status Modal */}
      <ChangeAdminStatusModal
        isOpen={isStatusOpen}
        onClose={() => {
          setIsStatusOpen(false);
          setSelectedAdmin(null);
        }}
        onSuccess={fetchAdminUsersList}
        admin={selectedAdmin}
        currentUser={user}
      />
    </div>
  );
};

export default AdminUsers;
