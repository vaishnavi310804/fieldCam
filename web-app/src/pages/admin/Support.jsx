import { useState, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import SupportStats from "../../components/admin/support/SupportStats";
import SupportToolbar from "../../components/admin/support/SupportToolbar";
import SupportTable from "../../components/admin/support/SupportTable";

const initialTickets = [
  {
    id: "TKT-401",
    vendor: "Apex Field Co.",
    initials: "AF",
    avatarBg: "#C87A65",
    subject: "Cannot upload photos larger than 20MB",
    lastUpdate: "2 min ago",
    priority: "High",
    status: "Open",
    created: "Mar 12",
  },
  {
    id: "TKT-400",
    vendor: "SiteLine Pro",
    initials: "SP",
    avatarBg: "#5B67CA",
    subject: "Payment not received for INV-1035",
    lastUpdate: "1 hr ago",
    priority: "Urgent",
    status: "In Progress",
    created: "Mar 11",
  },
  {
    id: "TKT-399",
    vendor: "ClearVision Studios",
    initials: "CV",
    avatarBg: "#7C3AED",
    subject: "Request for project deadline extension",
    lastUpdate: "3 hrs ago",
    priority: "Medium",
    status: "Open",
    created: "Mar 10",
  },
  {
    id: "TKT-398",
    vendor: "FieldEye Inc.",
    initials: "FE",
    avatarBg: "#D97706",
    subject: "GPS metadata missing from photos",
    lastUpdate: "5 hrs ago",
    priority: "Medium",
    status: "In Progress",
    created: "Mar 9",
  },
  {
    id: "TKT-397",
    vendor: "OpsLens",
    initials: "OL",
    avatarBg: "#10B981",
    subject: "Need access to project PRJ-2843 documents",
    lastUpdate: "1 day ago",
    priority: "Low",
    status: "Resolved",
    created: "Mar 8",
  },
  {
    id: "TKT-396",
    vendor: "CamTrack",
    initials: "CT",
    avatarBg: "#6B7280",
    subject: "Account suspension appeal",
    lastUpdate: "2 days ago",
    priority: "High",
    status: "Open",
    created: "Mar 7",
  },
  {
    id: "TKT-395",
    vendor: "ProShot Media",
    initials: "PS",
    avatarBg: "#2563EB",
    subject: "Mobile app crashing on Android 14",
    lastUpdate: "3 days ago",
    priority: "Medium",
    status: "Closed",
    created: "Mar 5",
  },
];

const Support = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredTickets = useMemo(() => {
    return initialTickets.filter((ticket) => {
      // Filter by status tab
      if (activeFilter !== "All" && ticket.status !== activeFilter) {
        return false;
      }

      // Filter by search query (Ticket ID, Vendor, Subject)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          ticket.id.toLowerCase().includes(query) ||
          ticket.vendor.toLowerCase().includes(query) ||
          ticket.subject.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [searchTerm, activeFilter]);

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
        {/* Support Page Header */}
        <AdminHeader
          title="Support"
          subtitle="Manage vendor support tickets and communications."
          showSearch={true}
        />

        {/* Support Page Body */}
        <main className="flex-1 p-6 space-y-5">
          {/* 1. KPI Cards Row */}
          <SupportStats />

          {/* 2. Toolbar (Search Input & Filter Tabs) */}
          <SupportToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          {/* 3. Support Tickets Table Card */}
          <SupportTable tickets={filteredTickets} />
        </main>
      </div>
    </div>
  );
};

export default Support;
