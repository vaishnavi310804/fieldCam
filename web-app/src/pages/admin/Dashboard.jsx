import { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import StatCard from "../../components/admin/StatCard";
import EarningsChart from "../../components/admin/EarningsChart";
import VendorPerformance from "../../components/admin/VendorPerformance";
import RecentActivity from "../../components/admin/RecentActivity";
import RecentSubmissions from "../../components/admin/RecentSubmissions";

const Dashboard = () => {
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
        {/* Top Header */}
        <AdminHeader />

        {/* Main Dashboard Body */}
        <main className="flex-1 p-6 space-y-5">
          {/* 1. KPI Stat Cards */}
          <StatCard />

          {/* 2. Top Chart Row: Earnings Analytics (50%) & Vendor Performance (50%) with equal row height & width */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            <div className="flex flex-col min-h-[380px] lg:h-[385px]">
              <EarningsChart />
            </div>
            <div className="flex flex-col min-h-[380px] lg:h-[385px]">
              <VendorPerformance />
            </div>
          </div>

          {/* 3. Bottom Row: Recent Activity (50%) & Recent Submissions (50%) with equal row height */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            <div className="flex flex-col min-h-[380px] lg:h-[385px]">
              <RecentActivity />
            </div>
            <div className="flex flex-col min-h-[380px] lg:h-[385px]">
              <RecentSubmissions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
