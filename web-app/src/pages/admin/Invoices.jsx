import { useState, useEffect, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import InvoiceStats from "../../components/admin/invoices/InvoiceStats";
import PaymentOverview from "../../components/admin/invoices/PaymentOverview";
import InvoiceToolbar from "../../components/admin/invoices/InvoiceToolbar";
import InvoiceTable from "../../components/admin/invoices/InvoiceTable";
import CreateInvoiceModal from "../../components/admin/invoices/CreateInvoiceModal";
import {
  getInvoices,
  getInvoiceStats,
  getInvoiceOverview,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
} from "../../services/invoiceService";
import { useAuth } from "../../context/AuthContext";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

const Invoices = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [allInvoices, setAllInvoices] = useState([]);
  const [statsData, setStatsData] = useState({});
  const [overviewData, setOverviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const isReadOnly = user?.role === "VENDOR";

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invoicesRes, statsRes, overviewRes] = await Promise.all([
        getInvoices(),
        getInvoiceStats(),
        getInvoiceOverview(),
      ]);

      setAllInvoices(invoicesRes?.data || []);
      setStatsData(statsRes?.data || statsRes || {});
      setOverviewData(overviewRes?.data || overviewRes || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load invoices data from platform service"
      );
      setAllInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInvoice = async (payload) => {
    await createInvoice(payload);
    await loadData();
  };

  const handleUpdateStatus = async (id, status) => {
    await updateInvoiceStatus(id, status);
    await loadData();
  };

  const handleEditInvoice = async (id, updateData) => {
    await updateInvoice(id, updateData);
    await loadData();
  };

  const filteredInvoices = useMemo(() => {
    return allInvoices.filter((invoice) => {
      // Filter by status tab
      if (activeFilter !== "All" && invoice.status !== activeFilter) {
        return false;
      }

      // Filter by search query (Invoice ID, Vendor Name, Project Title)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const invId = (invoice.invoiceId || invoice.id || "").toLowerCase();
        const vName = (
          invoice.vendorName ||
          invoice.vendorId?.companyName ||
          invoice.vendor ||
          ""
        ).toLowerCase();
        const pTitle = (
          invoice.projectTitle ||
          invoice.projectId?.projectName ||
          invoice.project ||
          ""
        ).toLowerCase();
        const pCode = (
          invoice.projectId?.projectId ||
          (typeof invoice.projectId === "string" ? invoice.projectId : "")
        ).toLowerCase();

        return (
          invId.includes(query) ||
          vName.includes(query) ||
          pTitle.includes(query) ||
          pCode.includes(query)
        );
      }

      return true;
    });
  }, [allInvoices, searchTerm, activeFilter]);

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
        {/* Invoices Page Header */}
        <AdminHeader
          title="Invoices"
          subtitle="Track payments and manage vendor invoices."
          showSearch={true}
        />

        {/* Invoices Page Body */}
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

          {/* 1. Summary Cards */}
          <InvoiceStats statsData={statsData} />

          {/* 2. Payment Overview Recharts BarChart */}
          <PaymentOverview overviewData={overviewData} />

          {/* 3. Toolbar (Search, Filter Tabs, Export, New Invoice Buttons) */}
          <InvoiceToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onOpenCreateModal={() => setCreateModalOpen(true)}
            isReadOnly={isReadOnly}
          />

          {/* 4. Invoice Table Card */}
          {loading ? (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-12 text-center text-xs text-[#817B77]">
              Loading invoices from platform service...
            </div>
          ) : (
            <InvoiceTable
              invoices={filteredInvoices}
              onUpdateStatus={handleUpdateStatus}
              onEditInvoice={handleEditInvoice}
              isReadOnly={isReadOnly}
            />
          )}
        </main>
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateInvoice={handleCreateInvoice}
      />
    </div>
  );
};

export default Invoices;
