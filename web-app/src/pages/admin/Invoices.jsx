import { useState, useEffect, useMemo, useCallback } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import InvoiceStats from "../../components/admin/invoices/InvoiceStats";
import PaymentOverview from "../../components/admin/invoices/PaymentOverview";
import InvoiceToolbar from "../../components/admin/invoices/InvoiceToolbar";
import InvoiceTable from "../../components/admin/invoices/InvoiceTable";
import {
  getInvoices,
  getInvoiceStats,
  getInvoiceOverview,
  reviewInvoice,
  sendInvoice,
  recordInvoicePayment,
  downloadInvoicePdf,
} from "../../services/invoiceService";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { FiAlertCircle, FiCheckCircle, FiRefreshCw, FiX } from "react-icons/fi";

const Invoices = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [allInvoices, setAllInvoices] = useState([]);
  const [statsData, setStatsData] = useState({});
  const [overviewData, setOverviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  const isReadOnly = user?.role === "VENDOR";

  const loadData = useCallback(async () => {
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
        err.response?.data?.message || err.message || "Failed to load invoices data..."
      );
      setAllInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const [invoicesRes, statsRes, overviewRes] = await Promise.all([
          getInvoices(),
          getInvoiceStats(),
          getInvoiceOverview(),
        ]);

        if (isMounted) {
          setAllInvoices(invoicesRes?.data || []);
          setStatsData(statsRes?.data || statsRes || {});
          setOverviewData(overviewRes?.data || overviewRes || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || err.message || "Failed to load invoices data..."
          );
          setAllInvoices([]);
          setLoading(false);
        }
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleReviewInvoice = async (id, payload) => {
    if (!can("INVOICES", "REVIEW")) return;
    try {
      const res = await reviewInvoice(id, payload);
      setActionFeedback({
        type: "success",
        message: res.message || `Invoice ${payload.action === "APPROVE" ? "approved" : "rejected"} successfully.`,
      });
      await loadData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to review invoice.";
      setActionFeedback({ type: "error", message: errMsg });
      throw err;
    }
  };

  const handleSendInvoice = async (id, payload) => {
    if (!can("INVOICES", "SEND")) return;
    try {
      const res = await sendInvoice(id, payload);
      setActionFeedback({
        type: "success",
        message: res.message || `Invoice sent to client (${payload.recipientEmail}) successfully.`,
      });
      await loadData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to send invoice.";
      setActionFeedback({ type: "error", message: errMsg });
      throw err;
    }
  };

  const handleRecordPayment = async (id, payload) => {
    if (!can("INVOICES", "RECORD_PAYMENT")) return;
    try {
      const res = await recordInvoicePayment(id, payload);
      setActionFeedback({
        type: "success",
        message: res.message || "Payment recorded successfully.",
      });
      await loadData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to record payment.";
      setActionFeedback({ type: "error", message: errMsg });
      throw err;
    }
  };

  const handleDownloadPdf = async (invoice) => {
    try {
      await downloadInvoicePdf(invoice._id, invoice.invoiceId);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to download invoice PDF.";
      setActionFeedback({ type: "error", message: errMsg });
    }
  };

  const filteredInvoices = useMemo(() => {
    return allInvoices.filter((invoice) => {
      // Filter by status tab
      if (activeFilter !== "All") {
        if (activeFilter === "Submitted") {
          // Submitted tab covers both Submitted and legacy Pending
          if (invoice.status !== "Submitted" && invoice.status !== "Pending") {
            return false;
          }
        } else if (invoice.status !== activeFilter) {
          return false;
        }
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

  const handleExportCsv = useCallback(() => {
    if (filteredInvoices.length === 0) return;
    const headers = [
      "Invoice ID",
      "Vendor",
      "Project",
      "Invoice Date",
      "Due Date",
      "Total Amount",
      "Status",
      "Payment Date",
    ];
    const rows = filteredInvoices.map((inv) => [
      `"${inv.invoiceId || ""}"`,
      `"${inv.vendorName || inv.vendorId?.companyName || ""}"`,
      `"${inv.projectTitle || inv.projectId?.projectName || ""}"`,
      `"${inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : ""}"`,
      `"${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : ""}"`,
      `"${inv.totalAmount || inv.amount || 0}"`,
      `"${inv.status || ""}"`,
      `"${inv.paymentDate ? new Date(inv.paymentDate).toLocaleDateString() : ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const exportTimestamp = Math.floor(new Date().getTime() / 1000);
    link.setAttribute("download", `FieldCam_Invoices_${exportTimestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredInvoices]);

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
          {/* Action Feedback Banner */}
          {actionFeedback && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
                actionFeedback.type === "success"
                  ? "bg-[#E8F5E9] border border-[#2E7D32]/20 text-[#2E7D32]"
                  : "bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828]"
              }`}
            >
              <div className="flex items-center gap-2">
                {actionFeedback.type === "success" ? (
                  <FiCheckCircle className="text-base shrink-0" />
                ) : (
                  <FiAlertCircle className="text-base shrink-0" />
                )}
                <span>{actionFeedback.message}</span>
              </div>
              <button
                onClick={() => setActionFeedback(null)}
                className="p-1 rounded-lg hover:bg-black/5"
              >
                <FiX className="text-sm" />
              </button>
            </div>
          )}

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

          {/* 3. Toolbar (Search, Filter Tabs, Export) */}
          <InvoiceToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onExport={handleExportCsv}
          />

          {/* 4. Invoice Table Card */}
          {loading ? (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-12 text-center text-xs text-[#817B77]">
              Loading invoices...
            </div>
          ) : (
            <InvoiceTable
              invoices={filteredInvoices}
              onReviewInvoice={handleReviewInvoice}
              onSendInvoice={handleSendInvoice}
              onRecordPayment={handleRecordPayment}
              onDownloadPdf={handleDownloadPdf}
              isReadOnly={isReadOnly}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Invoices;
