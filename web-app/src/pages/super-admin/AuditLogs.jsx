import { useState, useEffect, useCallback, useMemo } from "react";
import SuperAdminSidebar from "../../components/super-admin/SuperAdminSidebar";
import SuperAdminHeader from "../../components/super-admin/SuperAdminHeader";
import SuperAdminMetricCard from "../../components/super-admin/SuperAdminMetricCard";
import AuditLogsTable from "../../components/super-admin/AuditLogsTable";
import AuditLogDetailsModal from "../../components/super-admin/AuditLogDetailsModal";
import { getAuditLogs } from "../../services/auditService.js";
import {
  FiActivity,
  FiShield,
  FiUsers,
  FiClock,
  FiSearch,
  FiRefreshCw,
  FiFilter,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
} from "react-icons/fi";

const ENTITY_CATEGORIES = [
  { value: "ALL", label: "All Categories" },
  { value: "AdminUser", label: "Admin Users" },
  { value: "Role", label: "Roles & Access" },
  { value: "Vendor", label: "Companies & Vendors" },
  { value: "SubscriptionPlan", label: "Subscription Plans" },
  { value: "CompanySubscription", label: "Company Subscriptions" },
  { value: "Project", label: "Projects" },
  { value: "Invoice", label: "Invoices" },
  { value: "Support", label: "Support" },
  { value: "Service", label: "Services" },
];

const ACTOR_ROLES = [
  { value: "ALL", label: "All Roles" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "FULL_ADMIN", label: "Full Admin" },
  { value: "CUSTOM", label: "Custom Role Admins" },
];

const COMMON_ACTIONS = [
  { value: "ALL", label: "All Action Events" },
  { value: "ADMIN_USER_CREATED", label: "Admin User Created" },
  { value: "ADMIN_ROLE_REASSIGNED", label: "Admin Role Reassigned" },
  { value: "ADMIN_STATUS_CHANGED", label: "Admin Status Changed" },
  { value: "ROLE_CREATED", label: "Role Created" },
  { value: "ROLE_UPDATED", label: "Role Updated" },
  { value: "ROLE_DELETED", label: "Role Deleted" },
  { value: "VENDOR_CREATED", label: "Vendor Created" },
  { value: "VENDOR_UPDATED", label: "Vendor Updated" },
  { value: "VENDOR_STATUS_CHANGED", label: "Vendor Status Changed" },
  { value: "SUBSCRIPTION_PLAN_CREATED", label: "Subscription Plan Created" },
  { value: "SUBSCRIPTION_PLAN_PUBLISHED", label: "Subscription Plan Published" },
  { value: "SUBSCRIPTION_ASSIGNED", label: "Subscription Assigned" },
  { value: "PROJECT_CREATED", label: "Project Created" },
  { value: "PROJECT_STATUS_CHANGED", label: "Project Status Changed" },
  { value: "INVOICE_CREATED", label: "Invoice Created" },
  { value: "INVOICE_APPROVED", label: "Invoice Approved" },
  { value: "INVOICE_SENT", label: "Invoice Sent" },
  { value: "INVOICE_PAID", label: "Invoice Paid" },
  { value: "SUPPORT_TICKET_CREATED", label: "Support Ticket Created" },
  { value: "SUPPORT_TICKET_STATUS_CHANGED", label: "Support Status Changed" },
  { value: "SERVICE_CREATED", label: "Service Created" },
  { value: "SERVICE_STATUS_CHANGED", label: "Service Status Changed" },
];

const AuditLogs = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [actorRoleFilter, setActorRoleFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 15,
  });

  // Telemetry counts
  const [stats, setStats] = useState({
    total: 0,
    superAdminCount: 0,
    adminCount: 0,
    todayCount: 0,
  });

  // Data state
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal details state
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== "" ||
      actorRoleFilter !== "ALL" ||
      categoryFilter !== "ALL" ||
      actionFilter !== "ALL" ||
      startDate !== "" ||
      endDate !== ""
    );
  }, [searchQuery, actorRoleFilter, categoryFilter, actionFilter, startDate, endDate]);

  // Clear/reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setActorRoleFilter("ALL");
    setCategoryFilter("ALL");
    setActionFilter("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // Fetch audit logs from backend
  const fetchAuditLogsList = useCallback(async () => {
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
      if (actorRoleFilter !== "ALL") {
        params.actorRole = actorRoleFilter;
      }
      if (categoryFilter !== "ALL") {
        params.entityType = categoryFilter;
      }
      if (actionFilter !== "ALL") {
        params.action = actionFilter;
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const res = await getAuditLogs(params);
      if (res?.success && Array.isArray(res?.data)) {
        setLogs(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load administrative audit logs from platform server."
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, actorRoleFilter, categoryFilter, actionFilter, startDate, endDate]);

  // Fetch on parameter changes
  useEffect(() => {
    fetchAuditLogsList();
  }, [fetchAuditLogsList]);

  // Open details modal
  const handleOpenDetails = (logItem) => {
    setSelectedLog(logItem);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedLog(null);
    setIsDetailsOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex font-sans antialiased text-[#2D3436]">
      {/* Super Admin Navigation Sidebar */}
      <SuperAdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[220px]"
        }`}
      >
        {/* Global Super Admin Header */}
        <SuperAdminHeader
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            setPage(1);
          }}
        />

        {/* Main Content */}
        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Title & Description */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#2D3436] tracking-tight">
                Audit Logs
              </h1>
              <p className="text-xs md:text-sm text-[#817B77] mt-1 font-medium">
                Comprehensive audit trail recording administrative activity, role
                management, and system mutations across FieldCam.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                type="button"
                onClick={fetchAuditLogsList}
                className="inline-flex items-center gap-1.5 p-2.5 bg-white border border-[#EBE6E3] text-[#6E6763] hover:text-[#2D3436] hover:bg-[#FAF7F5] rounded-xl shadow-2xs transition cursor-pointer text-xs font-semibold"
                title="Refresh logs"
              >
                <FiRefreshCw className={`text-sm ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={fetchAuditLogsList}
                className="underline hover:text-red-900 font-bold ml-4 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <SuperAdminMetricCard
              title="Total Audit Events"
              value={`${stats.total || pagination.totalRecords || 0}`}
              change={null}
              isAvailable={true}
              icon={FiActivity}
              iconBg="bg-indigo-50 text-indigo-600 border border-indigo-100"
            />

            <SuperAdminMetricCard
              title="Super Admin Actions"
              value={`${stats.superAdminCount || 0}`}
              change={null}
              isAvailable={true}
              icon={FiShield}
              iconBg="bg-purple-50 text-purple-600 border border-purple-100"
            />

            <SuperAdminMetricCard
              title="Admin & Operations"
              value={`${stats.adminCount || 0}`}
              change={null}
              isAvailable={true}
              icon={FiUsers}
              iconBg="bg-blue-50 text-blue-600 border border-blue-100"
            />

            <SuperAdminMetricCard
              title="Today's Activity"
              value={`${stats.todayCount || 0}`}
              change={null}
              isAvailable={true}
              icon={FiClock}
              iconBg="bg-emerald-50 text-emerald-600 border border-emerald-100"
            />
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-[#EBE6E3] rounded-2xl p-4 shadow-xs space-y-3.5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {/* Search Field */}
              <div className="relative flex-1">
                <FiSearch
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77]"
                  size={14}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by actor, action, target entity, or description..."
                  className="w-full h-9 bg-[#F8F7FF] border border-[#E5E7EB] rounded-xl pl-9 pr-4 text-xs text-[#2D3436] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#5141F5] focus:bg-white"
                />
              </div>

              {/* Actor Role Filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={actorRoleFilter}
                  onChange={(e) => {
                    setActorRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-44 h-9 bg-white border border-[#EBE6E3] rounded-xl px-3 text-xs text-[#2D3436] font-medium outline-none focus:border-[#817B77] cursor-pointer"
                >
                  {ACTOR_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Category / Entity Filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-48 h-9 bg-white border border-[#EBE6E3] rounded-xl px-3 text-xs text-[#2D3436] font-medium outline-none focus:border-[#817B77] cursor-pointer"
                >
                  {ENTITY_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Action Filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-52 h-9 bg-white border border-[#EBE6E3] rounded-xl px-3 text-xs text-[#2D3436] font-medium outline-none focus:border-[#817B77] cursor-pointer"
                >
                  {COMMON_ACTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Second row: Date Range and Clear Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#F2EBE5]">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#817B77] font-semibold flex items-center gap-1 text-[11px]">
                  <FiCalendar className="text-xs" />
                  Date Range:
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 bg-white border border-[#EBE6E3] rounded-lg px-2 text-xs text-[#2D3436] outline-none focus:border-[#817B77]"
                  title="From Date"
                />
                <span className="text-[#817B77] text-xs">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 bg-white border border-[#EBE6E3] rounded-lg px-2 text-xs text-[#2D3436] outline-none focus:border-[#817B77]"
                  title="To Date"
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F5] hover:bg-rose-50 text-[#817B77] hover:text-rose-700 border border-[#EBE6E3] hover:border-rose-200 rounded-lg text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
                >
                  <FiXCircle className="text-xs" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Activity Logs Table */}
          <AuditLogsTable
            logs={logs}
            loading={loading}
            onViewDetails={handleOpenDetails}
          />

          {/* Server-Side Pagination Controls */}
          {pagination.totalRecords > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 text-xs text-[#817B77]">
              <div className="flex items-center gap-2">
                <span>
                  Showing{" "}
                  <strong>
                    {Math.min(
                      pagination.totalRecords,
                      (pagination.currentPage - 1) * pagination.pageSize + 1
                    )}
                  </strong>{" "}
                  to{" "}
                  <strong>
                    {Math.min(
                      pagination.totalRecords,
                      pagination.currentPage * pagination.pageSize
                    )}
                  </strong>{" "}
                  of <strong>{pagination.totalRecords}</strong> events
                </span>

                <span className="text-[#D1C7BD]">•</span>

                <div className="flex items-center gap-1">
                  <span>Show</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="bg-white border border-[#EBE6E3] rounded-lg px-1.5 py-0.5 text-xs text-[#2D3436] outline-none focus:border-[#817B77] cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>per page</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#EBE6E3] rounded-lg font-semibold text-[#6E6763] hover:text-[#2D3436] hover:bg-[#FAF7F5] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                >
                  <FiChevronLeft className="text-xs" />
                  <span>Previous</span>
                </button>

                <span className="px-3 py-1.5 font-bold text-[#2D3436]">
                  Page {pagination.currentPage} of {pagination.totalPages || 1}
                </span>

                <button
                  type="button"
                  disabled={page >= pagination.totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#EBE6E3] rounded-lg font-semibold text-[#6E6763] hover:text-[#2D3436] hover:bg-[#FAF7F5] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                >
                  <span>Next</span>
                  <FiChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Audit Log Event Details Modal */}
      <AuditLogDetailsModal
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        log={selectedLog}
      />
    </div>
  );
};

export default AuditLogs;
