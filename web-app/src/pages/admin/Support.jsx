import { useState, useEffect, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import SupportStats from "../../components/admin/support/SupportStats";
import SupportToolbar from "../../components/admin/support/SupportToolbar";
import SupportTable from "../../components/admin/support/SupportTable";
import CreateSupportTicketModal from "../../components/admin/support/CreateSupportTicketModal";
import {
  getSupportTickets,
  getSupportStats,
  createSupportTicket,
  updateSupportTicket,
  updateSupportTicketStatus,
} from "../../services/supportService";
import { useAuth } from "../../context/AuthContext";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

const Support = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [allTickets, setAllTickets] = useState([]);
  const [statsData, setStatsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const isReadOnly = user?.role === "VENDOR";

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isReadOnly) {
        const [ticketsRes, statsRes] = await Promise.all([
          getSupportTickets(),
          getSupportStats(),
        ]);
        setAllTickets(ticketsRes?.data || []);
        setStatsData(statsRes?.data || statsRes || {});
      } else {
        const ticketsRes = await getSupportTickets();
        setAllTickets(ticketsRes?.data || []);
        setStatsData({});
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load support tickets from server"
      );
      setAllTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateTicket = async (payload) => {
    await createSupportTicket(payload);
    await loadData();
  };

  const handleUpdateStatus = async (id, status) => {
    await updateSupportTicketStatus(id, status);
    await loadData();
  };

  const handleEditTicket = async (id, updateData) => {
    await updateSupportTicket(id, updateData);
    await loadData();
  };

  const filteredTickets = useMemo(() => {
    return allTickets.filter((ticket) => {
      // Filter by status tab
      if (activeFilter !== "All" && ticket.status !== activeFilter) {
        return false;
      }

      // Filter by search query (Ticket ID, Vendor Name, Subject)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const tId = (ticket.ticketId || ticket.id || "").toLowerCase();
        const vName = (
          ticket.vendorName ||
          ticket.vendorId?.companyName ||
          ticket.vendor ||
          ""
        ).toLowerCase();
        const subject = (ticket.subject || "").toLowerCase();

        return (
          tId.includes(query) ||
          vName.includes(query) ||
          subject.includes(query)
        );
      }

      return true;
    });
  }, [allTickets, searchTerm, activeFilter]);

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
          {/* Error Banner */}
          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 bg-[#C62828] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#B71C1C] transition-colors"
              >
                <FiRefreshCw className="text-xs" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* 1. KPI Cards Row (SuperAdmin & Admin only) */}
          {!isReadOnly && <SupportStats statsData={statsData} />}

          {/* 2. Toolbar (Search Input & Filter Tabs) */}
          <SupportToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onOpenCreateModal={() => setCreateModalOpen(true)}
            isReadOnly={isReadOnly}
          />

          {/* 3. Support Tickets Table Card */}
          {loading ? (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-12 text-center text-xs text-[#817B77]">
              Loading support tickets from platform service...
            </div>
          ) : (
            <SupportTable
              tickets={filteredTickets}
              onUpdateStatus={handleUpdateStatus}
              onEditTicket={handleEditTicket}
              isReadOnly={isReadOnly}
            />
          )}
        </main>
      </div>

      {/* Create Support Ticket Modal */}
      <CreateSupportTicketModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateTicket={handleCreateTicket}
      />
    </div>
  );
};

export default Support;
