import { useState, useEffect } from "react";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import VendorHeader from "../../components/vendor/VendorHeader";
import PerformanceHeader from "../../components/vendor/performance/PerformanceHeader";
import PerformanceKpiGrid from "../../components/vendor/performance/PerformanceKpiGrid";
import MonthlyCompletionChart from "../../components/vendor/performance/MonthlyCompletionChart";
import ApprovalRateTrendChart from "../../components/vendor/performance/ApprovalRateTrendChart";
import CompletionTimeChart from "../../components/vendor/performance/CompletionTimeChart";
import ApprovalSummary from "../../components/vendor/performance/ApprovalSummary";
import ServiceTypeBreakdown from "../../components/vendor/performance/ServiceTypeBreakdown";
import TopRejectionReasons from "../../components/vendor/performance/TopRejectionReasons";
import StaffPerformanceFallback from "../../components/vendor/performance/StaffPerformanceFallback";
import MilestonesSummary from "../../components/vendor/performance/MilestonesSummary";
import { getVendorPerformanceData } from "../../services/vendorPerformanceService";
import { getMyVendorProfile } from "../../services/vendorService";
import { useAuth } from "../../context/AuthContext";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { FaRegChartBar } from "react-icons/fa";

const Performance = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("THIS_YEAR");

  const [vendorProfile, setVendorProfile] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPerformanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vendorRes, perfData] = await Promise.all([
        getMyVendorProfile().catch(() => null),
        getVendorPerformanceData(),
      ]);

      if (vendorRes) {
        setVendorProfile(vendorRes.data || vendorRes);
      }

      setPerformanceData(perfData);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load vendor performance data."
      );
      setPerformanceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const handleExportCSV = () => {
    if (!performanceData || !performanceData.summary) return;

    const summary = performanceData.summary;
    const rows = [
      ["Metric", "Value"],
      ["Projects Completed", summary.completed],
      ["Projects Rejected", summary.rejected],
      ["Approval Rate", summary.approvalRate !== null ? `${summary.approvalRate}%` : "-"],
      ["Avg Turnaround Days", summary.avgTurnaroundDays !== null ? `${summary.avgTurnaroundDays} days` : "-"],
      ["Total Projects", summary.totalProjects],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `vendor_performance_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const vendorDisplayName =
    vendorProfile?.companyName ||
    vendorProfile?.userId?.name ||
    user?.name ||
    "Vendor Partner";

  const hasData = performanceData && performanceData.summary?.totalProjects > 0;

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#2D3436] font-sans antialiased">
      {/* Shared Vendor Sidebar */}
      <VendorSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Layout Area */}
      <div
        className={`min-h-screen bg-[#F4F0ED] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Shared Vendor Header */}
        <VendorHeader
          title="FieldWork Cam"
          vendorName={vendorDisplayName}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-6 space-y-5 max-w-7xl w-full mx-auto">
          {/* 1. Header & Controls */}
          <PerformanceHeader
            periodFilter={periodFilter}
            setPeriodFilter={setPeriodFilter}
            onExport={handleExportCSV}
            hasData={hasData}
          />

          {/* 2. KPI Cards Grid */}
          <PerformanceKpiGrid
            summary={performanceData?.summary}
            loading={loading}
          />

          {/* 3. Monthly Project Completion Chart */}
          <div className="min-h-[320px]">
            <MonthlyCompletionChart
              data={performanceData?.monthlyCompletionData || []}
            />
          </div>

          {/* 4. Approval Rate Trend Chart */}
          <div className="min-h-[300px]">
            <ApprovalRateTrendChart
              data={performanceData?.approvalRateTrendData || []}
            />
          </div>

          {/* 5. Lower Analytics Row (3 Columns: Completion Time, Approval Summary, Work Types) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            <div className="min-h-[280px]">
              <CompletionTimeChart
                data={performanceData?.completionTimeData || []}
              />
            </div>
            <div className="min-h-[280px]">
              <ApprovalSummary
                statusBreakdown={performanceData?.statusBreakdown || []}
                summary={performanceData?.summary}
              />
            </div>
            <div className="min-h-[280px]">
              <ServiceTypeBreakdown
                workTypes={performanceData?.workTypesList || []}
              />
            </div>
          </div>

          {/* 6. Staff Performance Section */}
          <StaffPerformanceFallback />

          {/* 7. Top Rejection Reasons */}
          <div className="min-h-[220px]">
            <TopRejectionReasons
              rejectionReasons={performanceData?.rejectionReasonsList || []}
            />
          </div>

          {/* 8. Vendor Milestones Summary */}
          <MilestonesSummary summary={performanceData?.summary} />
        </main>
      </div>
    </div>
  );
};

export default Performance;
