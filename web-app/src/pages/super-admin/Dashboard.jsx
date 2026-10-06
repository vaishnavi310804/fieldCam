import { useState, useEffect, useCallback } from "react";
import SuperAdminSidebar from "../../components/super-admin/SuperAdminSidebar";
import SuperAdminHeader from "../../components/super-admin/SuperAdminHeader";
import SuperAdminMetricCard from "../../components/super-admin/SuperAdminMetricCard";
import GrowthTrendsChart from "../../components/super-admin/GrowthTrendsChart";
import RegionalAvailability from "../../components/super-admin/RegionalAvailability";
import ActiveOrganizationsTable from "../../components/super-admin/ActiveOrganizationsTable";
import { getSuperAdminDashboardStats } from "../../services/dashboardService";
import { FiDollarSign, FiUsers, FiZap, FiDatabase, FiRefreshCw } from "react-icons/fi";

const SuperAdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);

  // Fetch Super Admin Dashboard Statistics from backend API
  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSuperAdminDashboardStats();
      if (response?.success && response?.data) {
        setDashboardData(response.data);
      } else {
        setDashboardData(null);
      }
    } catch (err) {
      console.error("Failed to fetch Super Admin dashboard statistics:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load platform telemetry data. Please retry."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Filter organizations based on global search query
  const rawOrganizations = dashboardData?.topOrganizations || [];
  const filteredOrganizations = searchQuery
    ? rawOrganizations.filter(
        (org) =>
          org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          org.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          org.plan?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rawOrganizations;

  const metrics = dashboardData?.metrics;

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex text-[#2D3436]">
      {/* Super Admin Sidebar */}
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

        {/* Dashboard Main Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-xl font-extrabold text-[#2D3436] tracking-tight">
                Platform Overview
              </h1>
              <p className="text-xs md:text-sm text-[#817B77] mt-1 font-medium">
                Real-time global infrastructure and business performance telemetry.
              </p>
            </div>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <SuperAdminMetricCard
              title="Monthly Revenue"
              value={metrics?.monthlyRevenue?.value || "$0"}
              change={metrics?.monthlyRevenue?.change}
              isAvailable={metrics?.monthlyRevenue?.isAvailable ?? true}
              reason={metrics?.monthlyRevenue?.reason}
              icon={FiDollarSign}
              iconBg="bg-emerald-50 text-emerald-600 border border-emerald-100"
            />

            <SuperAdminMetricCard
              title="Active Users"
              value={metrics?.activeUsers?.value || "0"}
              change={metrics?.activeUsers?.change}
              isAvailable={metrics?.activeUsers?.isAvailable ?? true}
              reason={metrics?.activeUsers?.reason}
              icon={FiUsers}
              iconBg="bg-blue-50 text-blue-600 border border-blue-100"
            />

            <SuperAdminMetricCard
              title="Avg Latency"
              value={metrics?.avgLatency?.value || "N/A"}
              change={metrics?.avgLatency?.change}
              isAvailable={metrics?.avgLatency?.isAvailable ?? false}
              reason={metrics?.avgLatency?.reason || "Telemetry not integrated"}
              icon={FiZap}
              iconBg="bg-amber-50 text-amber-600 border border-amber-100"
            />

            <SuperAdminMetricCard
              title="Storage Usage"
              value={metrics?.storageUsage?.value || "N/A"}
              change={metrics?.storageUsage?.change}
              isAvailable={metrics?.storageUsage?.isAvailable ?? false}
              reason={metrics?.storageUsage?.reason || "Telemetry not integrated"}
              icon={FiDatabase}
              iconBg="bg-purple-50 text-purple-600 border border-purple-100"
            />
          </div>

          {/* Middle Row: Growth Trends Chart + Regional Availability */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GrowthTrendsChart
                data={dashboardData?.growthTrends || []}
                loading={loading}
              />
            </div>

            <div>
              <RegionalAvailability
                availabilityData={dashboardData?.regionalAvailability}
              />
            </div>
          </div>

          {/* Bottom Row: Top Active Organizations Table */}
          <div>
            <ActiveOrganizationsTable
              organizations={filteredOrganizations}
              loading={loading}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
