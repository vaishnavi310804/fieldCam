import { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AnalyticsStats from "../../components/admin/analytics/AnalyticsStats";
import MonthlyProjectsChart from "../../components/admin/analytics/MonthlyProjectsChart";
import RevenueAnalyticsChart from "../../components/admin/analytics/RevenueAnalyticsChart";
import VendorApprovalRate from "../../components/admin/analytics/VendorApprovalRate";
import RejectionReasons from "../../components/admin/analytics/RejectionReasons";
import ServiceBreakdown from "../../components/admin/analytics/ServiceBreakdown";

const Analytics = () => {
  const [collapsed, setCollapsed] = useState(false);

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
          {/* 1. KPI Cards Row (4 cards equal width) */}
          <AnalyticsStats />

          {/* 2. Main Charts Row (2 equal-width cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            <div className="flex flex-col min-h-[360px]">
              <MonthlyProjectsChart />
            </div>
            <div className="flex flex-col min-h-[360px]">
              <RevenueAnalyticsChart />
            </div>
          </div>

          {/* 3. Lower Analytics Row (3 equal-width cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            <div className="flex flex-col min-h-[380px]">
              <VendorApprovalRate />
            </div>
            <div className="flex flex-col min-h-[380px]">
              <RejectionReasons />
            </div>
            <div className="flex flex-col min-h-[380px]">
              <ServiceBreakdown />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
