import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AnalyticsStats from "../../components/admin/analytics/AnalyticsStats";
import MonthlyProjectsChart from "../../components/admin/analytics/MonthlyProjectsChart";
import RevenueAnalyticsChart from "../../components/admin/analytics/RevenueAnalyticsChart";
import VendorApprovalRate from "../../components/admin/analytics/VendorApprovalRate";
import RejectionReasons from "../../components/admin/analytics/RejectionReasons";
import ServiceBreakdown from "../../components/admin/analytics/ServiceBreakdown";
import { getAdminAnalyticsData } from "../../services/analyticsService";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

const Analytics = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminAnalyticsData();
      if (res?.data) {
        setAnalyticsData(res.data);
      } else if (res) {
        setAnalyticsData(res);
      }
    } catch (err) {
      console.error("Failed to load admin analytics:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load analytics data. Please verify your connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      {/* Fixed Sidebar */}
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container Area */}
      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Analytics Page Header */}
        <AdminHeader
          title="Analytics"
          subtitle="Field operations performance insights and trends."
          showSearch={true}
        />

        {/* Analytics Page Body */}
        <main className="flex-1 p-6 space-y-5">
          {/* Error Banner with Retry */}
          {error && (
            <div className="bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FiAlertCircle className="text-lg shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchAnalytics}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#FFCDD2] rounded-lg text-xs font-semibold text-[#C62828] hover:bg-[#FFEBEE] transition cursor-pointer"
              >
                <FiRefreshCw className="text-xs" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* 1. KPI Cards Row (4 cards equal width) */}
          <AnalyticsStats kpis={analyticsData?.kpis} loading={loading} />

          {/* 2. Main Charts Row (2 equal-width cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            <div className="flex flex-col min-h-[360px]">
              <MonthlyProjectsChart
                data={analyticsData?.monthlyProjects}
                loading={loading}
              />
            </div>
            <div className="flex flex-col min-h-[360px]">
              <RevenueAnalyticsChart
                data={analyticsData?.revenueAnalytics}
                loading={loading}
              />
            </div>
          </div>

          {/* 3. Lower Analytics Row (3 equal-width cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            <div className="flex flex-col min-h-[380px]">
              <VendorApprovalRate
                data={analyticsData?.vendorApprovalRates}
                loading={loading}
              />
            </div>
            <div className="flex flex-col min-h-[380px]">
              <RejectionReasons
                data={analyticsData?.rejectionReasons}
                loading={loading}
              />
            </div>
            <div className="flex flex-col min-h-[380px]">
              <ServiceBreakdown
                data={analyticsData?.serviceBreakdown}
                loading={loading}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
