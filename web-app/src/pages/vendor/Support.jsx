import React, { useState, useEffect } from "react";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import VendorHeader from "../../components/vendor/VendorHeader";
import VendorSupportActionCards from "../../components/vendor/support/VendorSupportActionCards";
import VendorSupportStats from "../../components/vendor/support/VendorSupportStats";
import VendorSupportTicketTable from "../../components/vendor/support/VendorSupportTicketTable";
import VendorCreateTicketModal from "../../components/vendor/support/VendorCreateTicketModal";
import {
  getSupportTickets,
  getSupportStats,
} from "../../services/supportService";
import { getMyVendorProfile } from "../../services/vendorService";
import { useAuth } from "../../context/AuthContext";
import { FiLifeBuoy, FiAlertCircle, FiRefreshCw, FiPlus } from "react-icons/fi";

const Support = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [vendorProfile, setVendorProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, ticketsRes, statsRes] = await Promise.all([
        getMyVendorProfile().catch(() => null),
        getSupportTickets(),
        getSupportStats(),
      ]);

      if (profileRes) {
        setVendorProfile(profileRes.data || profileRes);
      }

      const ticketsList = ticketsRes.data || ticketsRes || [];
      setTickets(Array.isArray(ticketsList) ? ticketsList : []);

      const statsData = statsRes.data || statsRes || null;
      setStats(statsData);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load support data from server"
      );
      setTickets([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const vendorDisplayName =
    vendorProfile?.companyName ||
    vendorProfile?.userId?.name ||
    user?.name ||
    "Vendor Partner";

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#2D3436] font-sans antialiased">
      {/* Vendor Sidebar */}
      <VendorSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container Area */}
      <div
        className={`min-h-screen bg-[#F4F0ED] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Vendor Header */}
        <VendorHeader
          title="FieldWork Cam"
          vendorName={vendorDisplayName}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-5 lg:p-6 space-y-4 max-w-7xl w-full mx-auto">
          {/* Support Center Compact Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D7CCC8]/60 text-[#5D4037] flex items-center justify-center font-bold shrink-0">
                <FiLifeBuoy size={16} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#3E3734] tracking-tight leading-tight">
                  Support Center
                </h1>
                <p className="text-[11px] text-[#817B77] font-medium">
                  Get help and manage your support tickets
                </p>
              </div>
            </div>

            {/* Header Right Action Area */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                title="Refresh Data"
                className="p-2 rounded-xl bg-white border border-[#E8E2DE] text-[#817B77] hover:text-[#3E3734] hover:bg-[#FAF7F5] transition-colors cursor-pointer shadow-2xs"
              >
                <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D7CCC8] hover:bg-[#C8B5AC] text-[#3E3734] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <FiPlus className="text-sm" />
                <span>New Ticket</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="flex items-center gap-1 bg-[#C62828] text-white px-2.5 py-1 rounded-xl font-bold hover:bg-[#B71C1C] transition-colors cursor-pointer text-xs"
              >
                <FiRefreshCw className="text-xs" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Section 1: Compact Action Cards (2x2 Grid) */}
          <VendorSupportActionCards
            onOpenRaiseTicket={() => setIsModalOpen(true)}
          />

          {/* Section 2: Compact Horizontal Statistics Row (4 Cards) */}
          <VendorSupportStats stats={stats} loading={loading} />

          {/* Section 3: Compact Tickets Table */}
          <VendorSupportTicketTable tickets={tickets} loading={loading} />
        </main>
      </div>

      {/* Raise Ticket Modal */}
      <VendorCreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

export default Support;
