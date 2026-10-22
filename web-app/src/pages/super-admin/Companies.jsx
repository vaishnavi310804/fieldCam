import { useState, useEffect, useCallback } from "react";
import SuperAdminSidebar from "../../components/super-admin/SuperAdminSidebar";
import SuperAdminHeader from "../../components/super-admin/SuperAdminHeader";
import SuperAdminMetricCard from "../../components/super-admin/SuperAdminMetricCard";
import CompaniesTable from "../../components/super-admin/CompaniesTable";
import ProvisionCompanyModal from "../../components/super-admin/ProvisionCompanyModal";
import EditCompanyModal from "../../components/super-admin/EditCompanyModal";
import {
  getCompanies,
  getCompanyStats,
  updateCompanyStatus,
} from "../../services/companyService";
import {
  FiPlus,
  FiDollarSign,
  FiCheckSquare,
  FiTrendingUp,
  FiPieChart,
  FiFilter,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";

const SuperAdminCompanies = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [availableServices, setAvailableServices] = useState([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [companyStats, setCompanyStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    suspendedVendors: 0,
    inactiveVendors: 0,
    newSignupsThisWeek: 0,
    totalRevenue: 0,
  });

  // Modal states
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // Fetch company stats summary
  const fetchStats = useCallback(async () => {
    try {
      const res = await getCompanyStats();
      if (res?.success && res?.data) {
        setCompanyStats(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch company summary statistics:", err);
    }
  }, []);

  // Fetch paginated & filtered companies list
  const fetchCompaniesList = useCallback(async () => {
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

      if (statusFilter && statusFilter !== "All Statuses") {
        params.status = statusFilter;
      }

      if (serviceFilter && serviceFilter !== "All Services") {
        params.service = serviceFilter;
      }

      const res = await getCompanies(params);

      if (res?.success) {
        if (Array.isArray(res.data)) {
          setCompanies(res.data);
          setTotalRecords(res.totalRecords || res.count || res.data.length);
          setTotalPages(res.totalPages || Math.ceil((res.totalRecords || res.data.length) / limit) || 1);
          // Accumulate known services so filtering does not empty dropdown options
          const discoveredServices = res.data.flatMap((c) =>
            Array.isArray(c.services) ? c.services : []
          );
          if (discoveredServices.length > 0) {
            setAvailableServices((prev) =>
              Array.from(new Set([...prev, ...discoveredServices])).sort()
            );
          }
        } else {
          setCompanies([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch companies list:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load companies data. Please retry."
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, statusFilter, serviceFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCompaniesList();
  }, [fetchCompaniesList]);

  // Handle status toggle (Activate / Suspend)
  const handleToggleStatus = async (company, newStatus) => {
    try {
      await updateCompanyStatus(company._id || company.id, newStatus);
      await fetchCompaniesList();
      await fetchStats();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update company status."
      );
    }
  };

  // Handle opening edit modal
  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setIsEditModalOpen(true);
  };


  const startRecordNum = (page - 1) * limit + 1;
  const endRecordNum = Math.min(page * limit, totalRecords);

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex text-[#2D3436]">
      {/* Super Admin Sidebar with Companies tab ACTIVE */}
      <SuperAdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[220px]"
        }`}
      >
        {/* Super Admin Header */}
        <SuperAdminHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Page Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#2D3436] tracking-tight">
                Companies
              </h1>
              <p className="text-xs md:text-sm text-[#817B77] mt-1 font-medium">
                Manage client organizations and platform partners.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsProvisionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#817B77] hover:bg-[#6E6763] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                <FiPlus className="text-sm" />
                <span>Provision New Company</span>
              </button>

              {error && (
                <button
                  type="button"
                  onClick={fetchCompaniesList}
                  className="p-2.5 bg-white border border-[#EBE6E3] text-[#6E6763] hover:text-[#2D3436] rounded-xl transition cursor-pointer"
                  title="Retry loading"
                >
                  <FiRefreshCw className="text-sm" />
                </button>
              )}
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <SuperAdminMetricCard
              title="Total Revenue"
              value="N/A"
              change={null}
              isAvailable={false}
              reason="Subscription payment gateway not integrated"
              icon={FiDollarSign}
              iconBg="bg-emerald-50 text-emerald-600 border border-emerald-100"
            />

            <SuperAdminMetricCard
              title="Active Companies"
              value={`${companyStats.activeVendors ?? 0}`}
              change={null}
              isAvailable={true}
              icon={FiCheckSquare}
              iconBg="bg-blue-50 text-blue-600 border border-blue-100"
            />

            <SuperAdminMetricCard
              title="New Sign Ups"
              value={`${companyStats.newSignupsThisWeek ?? 0}`}
              change={null}
              isAvailable={true}
              icon={FiTrendingUp}
              iconBg="bg-purple-50 text-purple-600 border border-purple-100"
            />

            <SuperAdminMetricCard
              title="Churn Rate"
              value="N/A"
              change={null}
              isAvailable={false}
              reason="Customer churn telemetry not integrated"
              icon={FiPieChart}
              iconBg="bg-amber-50 text-amber-600 border border-amber-100"
            />
          </div>

          {/* Filter Bar & View Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none bg-white border border-[#EBE6E3] text-[#2D3436] text-xs font-semibold rounded-xl pl-9 pr-8 py-2 outline-none cursor-pointer hover:bg-[#FAF7F5] transition shadow-xs"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
              </div>

              {/* Service Offering Filter */}
              <div className="relative">
                <select
                  value={serviceFilter}
                  onChange={(e) => {
                    setServiceFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none bg-white border border-[#EBE6E3] text-[#2D3436] text-xs font-semibold rounded-xl pl-4 pr-8 py-2 outline-none cursor-pointer hover:bg-[#FAF7F5] transition shadow-xs"
                >
                  <option value="All Services">All Services</option>
                  {Array.from(
                    new Set([
                      ...availableServices,
                      ...companies.flatMap((c) =>
                        Array.isArray(c.services) ? c.services : []
                      ),
                    ])
                  )
                    .sort()
                    .map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                </select>
                <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Companies Table */}
          <CompaniesTable
            companies={companies}
            loading={loading}
            onEditCompany={handleEditCompany}
            onToggleStatus={handleToggleStatus}
          />

          {/* Pagination Footer */}
          {!loading && totalRecords > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <p className="text-xs text-[#817B77]">
                Showing {startRecordNum} to {endRecordNum} of {totalRecords} companies
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-white border border-[#EBE6E3] text-[#2D3436] text-xs font-semibold rounded-lg hover:bg-[#FAF7F5] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <FiChevronLeft className="text-xs" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                          p === page
                            ? "bg-[#817B77] text-white"
                            : "bg-white border border-[#EBE6E3] text-[#2D3436] hover:bg-[#FAF7F5]"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 bg-white border border-[#EBE6E3] text-[#2D3436] text-xs font-semibold rounded-lg hover:bg-[#FAF7F5] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <FiChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Provision New Company Modal */}
      <ProvisionCompanyModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        onSuccess={() => {
          fetchCompaniesList();
          fetchStats();
        }}
      />

      {/* Edit Company Modal */}
      <EditCompanyModal
        company={editingCompany}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCompany(null);
        }}
        onSuccess={() => {
          fetchCompaniesList();
        }}
      />
    </div>
  );
};

export default SuperAdminCompanies;
