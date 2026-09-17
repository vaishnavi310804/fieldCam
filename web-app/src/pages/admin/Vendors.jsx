import { useState, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import VendorStats from "../../components/admin/vendors/VendorStats";
import VendorToolbar from "../../components/admin/vendors/VendorToolbar";
import VendorCard from "../../components/admin/vendors/VendorCard";

const initialVendors = [
  {
    id: 1,
    initials: "AF",
    avatarBg: "#C87A65",
    company: "Apex Field Co.",
    contact: "Marcus Rivera",
    location: "Portland, OR",
    joined: "Jan 2024",
    status: "Active",
    completed: 87,
    approval: "96%",
    activeProjects: 5,
    rating: 4.8,
    monthlyChange: "+8%",
    services: ["Site Inspection", "Aerial Mapping"],
  },
  {
    id: 2,
    initials: "SP",
    avatarBg: "#5B67CA",
    company: "SiteLine Pro",
    contact: "Jennifer Park",
    location: "Seattle, WA",
    joined: "Mar 2024",
    status: "Active",
    completed: 64,
    approval: "92%",
    activeProjects: 3,
    rating: 4.7,
    monthlyChange: "+5%",
    services: ["Property Survey", "Progress Docs"],
  },
  {
    id: 3,
    initials: "CV",
    avatarBg: "#7C3AED",
    company: "ClearVision Studios",
    contact: "Daniel Okafor",
    location: "Denver, CO",
    joined: "Jun 2024",
    status: "Active",
    completed: 52,
    approval: "88%",
    activeProjects: 4,
    rating: 4.5,
    monthlyChange: "+12%",
    services: ["Progress Docs", "Final Inspection"],
  },
  {
    id: 4,
    initials: "FE",
    avatarBg: "#D97706",
    company: "FieldEye Inc.",
    contact: "Sarah Nguyen",
    location: "Austin, TX",
    joined: "Aug 2024",
    status: "Active",
    completed: 38,
    approval: "84%",
    activeProjects: 2,
    rating: 4.3,
    monthlyChange: "-3%",
    services: ["Site Inspection", "Final Inspection"],
  },
  {
    id: 5,
    initials: "OL",
    avatarBg: "#10B981",
    company: "OpsLens",
    contact: "Alex Thompson",
    location: "Phoenix, AZ",
    joined: "Oct 2024",
    status: "Active",
    completed: 29,
    approval: "78%",
    activeProjects: 2,
    rating: 4.1,
    monthlyChange: "+2%",
    services: ["Aerial Mapping"],
  },
  {
    id: 6,
    initials: "CT",
    avatarBg: "#6B7280",
    company: "CamTrack",
    contact: "Ryan Walker",
    location: "Los Angeles, CA",
    joined: "Nov 2024",
    status: "Suspended",
    completed: 15,
    approval: "62%",
    activeProjects: 0,
    rating: 3.4,
    monthlyChange: "-15%",
    services: ["Site Inspection"],
  },
  {
    id: 7,
    initials: "PS",
    avatarBg: "#2563EB",
    company: "ProShot Media",
    contact: "Emily Chen",
    location: "San Francisco, CA",
    joined: "Dec 2024",
    status: "Active",
    completed: 21,
    approval: "91%",
    activeProjects: 3,
    rating: 4.6,
    monthlyChange: "+18%",
    services: ["Property Survey", "Aerial Mapping"],
  },
  {
    id: 8,
    initials: "FS",
    avatarBg: "#EF4444",
    company: "FieldScope",
    contact: "James Mitchell",
    location: "Chicago, IL",
    joined: "Feb 2025",
    status: "Suspended",
    completed: 8,
    approval: "55%",
    activeProjects: 0,
    rating: 2.9,
    monthlyChange: "-22%",
    services: ["Progress Docs"],
  },
];

const Vendors = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredVendors = useMemo(() => {
    return initialVendors.filter((vendor) => {
      // Filter by status tab
      if (activeFilter !== "All" && vendor.status !== activeFilter) {
        return false;
      }

      // Filter by search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          vendor.company.toLowerCase().includes(query) ||
          vendor.contact.toLowerCase().includes(query) ||
          vendor.location.toLowerCase().includes(query)
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
        {/* Vendors Page Header */}
        <AdminHeader
          title="Vendors"
          subtitle="Manage vendor relationships and performance."
          showSearch={true}
        />

        {/* Vendors Page Body */}
        <main className="flex-1 p-6 space-y-5">
          {/* 1. KPI Cards */}
          <VendorStats />

          {/* 2. Toolbar (Search, Filter Tabs, Add Vendor Button) */}
          <VendorToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          {/* 3. Vendor Cards Grid (2 columns on desktop) */}
          {filteredVendors.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              {filteredVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-12 text-center text-[#817B77]">
              <p className="text-sm font-semibold">No vendors found</p>
              <p className="text-xs mt-1">
                Try adjusting your search query or filter settings.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Vendors;
