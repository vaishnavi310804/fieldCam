import { useState, useEffect, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import VendorStats from "../../components/admin/vendors/VendorStats";
import VendorToolbar from "../../components/admin/vendors/VendorToolbar";
import VendorCard from "../../components/admin/vendors/VendorCard";
import { useAuth } from "../../context/AuthContext";
import {
  getVendors,
  getVendorStats,
  updateVendorStatus,
} from "../../services/vendorService";
import { FiLoader, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const Vendors = () => {
  const { user } = useAuth();
  const readOnly = user?.role === "VENDOR";

  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // API State
  const [vendorsList, setVendorsList] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");

  const fetchVendorsData = async () => {
    try {
      setLoading(true);
      setError("");

      const [vendorsRes, statsRes] = await Promise.all([
        getVendors(),
        getVendorStats().catch(() => null), // If stats forbidden (e.g. VENDOR role), catch safely
      ]);

      setVendorsList(vendorsRes.data || []);
      if (statsRes && statsRes.data) {
        setStatsData(statsRes.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load vendors data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorsData();
  }, []);

  const handleStatusChange = async (vendorId, newStatus) => {
    if (readOnly) return;

    try {
      setError("");
      await updateVendorStatus(vendorId, newStatus);
      setStatusSuccess(`Vendor status updated to ${newStatus}`);
      await fetchVendorsData();
      setTimeout(() => setStatusSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update vendor status"
      );
    }
  };

  const filteredVendors = useMemo(() => {
    return vendorsList.filter((vendor) => {
      // Filter by status tab
      if (activeFilter !== "All" && vendor.status !== activeFilter) {
        return false;
      }

      // Filter by search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const company = (vendor.companyName || vendor.company || "").toLowerCase();
        const contact = (vendor.contactName || vendor.contact || "").toLowerCase();
        const location = (vendor.location || "").toLowerCase();

        return (
          company.includes(query) ||
          contact.includes(query) ||
          location.includes(query)
        );
      }

      return true;
    });
  }, [vendorsList, searchTerm, activeFilter]);

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
          <VendorStats statsData={statsData} />

          {/* 2. Toolbar (Search, Filter Tabs, Add Vendor Button) */}
          <VendorToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            readOnly={readOnly}
          />

          {/* Feedback Alerts */}
          {loading && (
            <div className="bg-[#FAF7F5] border border-[#E8E2DE] text-[#817B77] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <FiLoader className="animate-spin text-base shrink-0" />
              <span>Loading vendor records from backend...</span>
            </div>
          )}

          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
              <FiAlertCircle className="text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {statusSuccess && (
            <div className="bg-[#E8F5E9] border border-[#2E7D32]/20 text-[#2E7D32] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
              <FiCheckCircle className="text-base shrink-0" />
              <span>{statusSuccess}</span>
            </div>
          )}

          {/* 3. Vendor Cards Grid (2 columns on desktop) */}
          {!loading && filteredVendors.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              {filteredVendors.map((vendor) => (
                <VendorCard
                  key={vendor._id}
                  vendor={vendor}
                  readOnly={readOnly}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : !loading && (
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
