import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import VendorHeader from "../../components/vendor/VendorHeader";
import {
  getInvoices,
  getInvoiceStats,
  submitInvoice,
  downloadInvoicePdf,
} from "../../services/invoiceService";
import { getMyVendorProfile } from "../../services/vendorService";
import { useAuth } from "../../context/AuthContext";
import MonthlyEarningsChart from "../../components/vendor/invoices/MonthlyEarningsChart";
import WeeklyEarningsChart from "../../components/vendor/invoices/WeeklyEarningsChart";
import PaymentHistoryTable from "../../components/vendor/invoices/PaymentHistoryTable";
import RaiseInvoiceModal from "../../components/vendor/invoices/RaiseInvoiceModal";
import VendorInvoiceDetailModal from "../../components/vendor/invoices/VendorInvoiceDetailModal";
import {
  FiFileText,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiPlus,
  FiAlertTriangle,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiArrowUpRight,
  FiCalendar,
} from "react-icons/fi";

const Invoices = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [collapsed, setCollapsed] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("THIS_YEAR");

  const [vendorProfile, setVendorProfile] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [statsData, setStatsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Modal States
  const [raiseModalOpen, setRaiseModalOpen] = useState(false);
  const [raiseProjectId, setRaiseProjectId] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);

  // Format currency helper
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const loadVendorInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vendorRes, invoiceRes, statsRes] = await Promise.all([
        getMyVendorProfile().catch(() => null),
        getInvoices(),
        getInvoiceStats().catch(() => ({})),
      ]);

      if (vendorRes) {
        setVendorProfile(vendorRes.data || vendorRes);
      }

      const invoiceData = invoiceRes.data || invoiceRes || [];
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
      setStatsData(statsRes.data || statsRes || {});
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load vendor invoices from server"
      );
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getMyVendorProfile().catch(() => null),
      getInvoices().catch(() => []),
      getInvoiceStats().catch(() => ({})),
    ]).then(([vendorRes, invoiceRes, statsRes]) => {
      if (!isMounted) return;
      if (vendorRes) {
        setVendorProfile(vendorRes.data || vendorRes);
      }
      const invoiceData = invoiceRes.data || invoiceRes || [];
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
      setStatsData(statsRes.data || statsRes || {});
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Check URL query parameters for auto-opening Raise Invoice modal
  useEffect(() => {
    const pId = searchParams.get("projectId");
    if (pId) {
      Promise.resolve().then(() => {
        setRaiseProjectId(pId);
        setEditingInvoice(null);
        setRaiseModalOpen(true);
      });
    }
  }, [searchParams]);

  // Handlers for Raise / Edit / Submit / Download
  const handleOpenRaiseModal = (projectId = null) => {
    setRaiseProjectId(projectId);
    setEditingInvoice(null);
    setRaiseModalOpen(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setRaiseProjectId(null);
    setViewingInvoice(null);
    setRaiseModalOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    setViewingInvoice(invoice);
  };

  const handleInvoiceSuccess = async (actionType) => {
    setActionFeedback({
      type: "success",
      message:
        actionType === "submitted"
          ? "Invoice submitted for Admin review successfully!"
          : "Invoice draft saved successfully.",
    });
    await loadVendorInvoices();
  };

  const handleSubmitDraft = async (invoiceId) => {
    setIsSubmittingDraft(true);
    try {
      await submitInvoice(invoiceId);
      setActionFeedback({
        type: "success",
        message: "Draft invoice submitted for Admin review successfully!",
      });
      setViewingInvoice(null);
      await loadVendorInvoices();
    } catch (err) {
      setActionFeedback({
        type: "error",
        message:
          err.response?.data?.message || err.message || "Failed to submit draft invoice.",
      });
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  const handleDownloadPdf = async (invoice) => {
    setDownloadingId(invoice._id);
    try {
      await downloadInvoicePdf(invoice._id, invoice.invoiceId);
    } catch (err) {
      setActionFeedback({
        type: "error",
        message:
          err.response?.data?.message || err.message || "Failed to download invoice PDF.",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // Period Filter Helper logic
  const isDateInPeriod = (dateStr, period) => {
    if (period === "ALL_TIME") return true;
    if (!dateStr) return false;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (period === "THIS_MONTH") {
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    }

    if (period === "LAST_MONTH") {
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      return (
        date.getFullYear() === lastMonthDate.getFullYear() &&
        date.getMonth() === lastMonthDate.getMonth()
      );
    }

    if (period === "THIS_YEAR") {
      return date.getFullYear() === currentYear;
    }

    return true;
  };

  // Filter invoices strictly by period for charts
  const periodFilteredInvoices = useMemo(() => {
    return invoices.filter((inv) => isDateInPeriod(inv.createdAt, periodFilter));
  }, [invoices, periodFilter]);

  // Monthly Earnings calculation for Recharts
  const monthlyData = useMemo(() => {
    const months = [
      "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
    ];

    const monthTotals = {};
    months.forEach((m) => (monthTotals[m] = 0));

    const paidInvoices = periodFilteredInvoices.filter(
      (inv) => inv.status === "Paid" && inv.paymentDate
    );

    paidInvoices.forEach((inv) => {
      const d = new Date(inv.paymentDate);
      if (!isNaN(d.getTime())) {
        const mName = d.toLocaleDateString("en-US", { month: "short" });
        if (monthTotals[mName] !== undefined) {
          monthTotals[mName] += Number(inv.totalAmount || 0);
        }
      }
    });

    return months.map((name) => ({ month: name, total: monthTotals[name] }));
  }, [periodFilteredInvoices]);

  // Weekly breakdown calculation
  const weeklyData = useMemo(() => {
    const weeks = [
      { label: "W1", total: 0 },
      { label: "W2", total: 0 },
      { label: "W3", total: 0 },
      { label: "W4", total: 0 },
    ];

    periodFilteredInvoices.forEach((inv) => {
      const d = inv.paymentDate ? new Date(inv.paymentDate) : new Date(inv.createdAt);
      if (!isNaN(d.getTime())) {
        const day = d.getDate();
        if (day <= 7) weeks[0].total += Number(inv.totalAmount || 0);
        else if (day <= 14) weeks[1].total += Number(inv.totalAmount || 0);
        else if (day <= 21) weeks[2].total += Number(inv.totalAmount || 0);
        else weeks[3].total += Number(inv.totalAmount || 0);
      }
    });

    const maxVal = Math.max(...weeks.map((w) => w.total), 1);
    return weeks.map((w, i) => ({
      ...w,
      heightPct: Math.min(100, Math.max(15, Math.round((w.total / maxVal) * 100))),
      isCurrent: i === 3,
    }));
  }, [periodFilteredInvoices]);

  // Payout Summary derivation from real invoices
  const payoutSummary = useMemo(() => {
    const approved = invoices.filter((i) => i.status === "Approved");
    const paid = invoices.filter((i) => i.status === "Paid");

    const nextPayoutAmount = approved.reduce(
      (acc, i) => acc + Number(i.totalAmount || i.amount || 0),
      0
    );
    const lastPayoutAmount =
      paid.length > 0 ? Number(paid[0].totalAmount || paid[0].amount || 0) : 0;
    const lastPayoutDate =
      paid.length > 0
        ? formatDate(paid[0].paymentDate || paid[0].updatedAt)
        : "N/A";

    let avgDays = "N/A";
    if (paid.length > 0) {
      let totalDiffMs = 0;
      let count = 0;
      paid.forEach((inv) => {
        if (inv.createdAt && inv.paymentDate) {
          const start = new Date(inv.createdAt).getTime();
          const end = new Date(inv.paymentDate).getTime();
          if (end > start) {
            totalDiffMs += end - start;
            count += 1;
          }
        }
      });
      if (count > 0) {
        const days = (totalDiffMs / (1000 * 60 * 60 * 24) / count).toFixed(1);
        avgDays = `${days} days`;
      }
    }

    return {
      nextPayout: nextPayoutAmount,
      nextDate: approved.length > 0 ? "Pending Processing" : "No pending payout",
      lastPayout: lastPayoutAmount,
      lastDate: lastPayoutDate,
      avgTime: avgDays,
      avgLabel: paid.length > 0 ? "After submission" : "No paid invoices",
    };
  }, [invoices]);

  // CSV Export handler
  const handleExportCSV = () => {
    if (invoices.length === 0) return;

    const headers = [
      "Invoice ID",
      "Project Title",
      "Vendor Name",
      "Amount",
      "Tax",
      "Total Amount",
      "Status",
      "Created Date",
      "Payment Date",
    ];

    const rows = invoices.map((inv) => [
      inv.invoiceId || inv._id,
      `"${(inv.projectTitle || inv.projectId?.projectName || "").replace(/"/g, '""')}"`,
      `"${(inv.vendorName || "").replace(/"/g, '""')}"`,
      inv.amount || 0,
      inv.tax || 0,
      inv.totalAmount || 0,
      inv.status || "Pending",
      formatDate(inv.createdAt),
      formatDate(inv.paymentDate),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const exportTime = Math.floor(new Date().getTime() / 1000);
    link.setAttribute("download", `vendor_invoices_${exportTime}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const vendorDisplayName =
    vendorProfile?.companyName ||
    vendorProfile?.userId?.name ||
    user?.name ||
    "Vendor Partner";

  // Backend Stats metrics (Source of Truth)
  const totalInvoiced = statsData.totalInvoiced ?? statsData.totalOutstanding ?? 0;
  const awaitingReviewAmount = statsData.awaitingReview?.amount ?? 0;
  const awaitingReviewCount =
    statsData.awaitingReview?.count ?? statsData.pendingReview ?? 0;
  const awaitingPaymentAmount = statsData.approvedAwaitingPayment?.amount ?? 0;
  const awaitingPaymentCount =
    statsData.approvedAwaitingPayment?.count ?? statsData.approved ?? 0;
  const paidEarningsAmount =
    statsData.actualPaidEarnings?.amount ??
    (typeof statsData.actualPaidEarnings === "number"
      ? statsData.actualPaidEarnings
      : 0);
  const paidEarningsCount = statsData.actualPaidEarnings?.count ?? 0;
  const paidThisMonthAmount = statsData.paidThisMonth ?? 0;

  const overdueCount = statsData.overdueUnpaid?.count ?? 0;
  const overdueAmount = statsData.overdueUnpaid?.amount ?? 0;

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
                  <FiCheck className="text-base shrink-0" />
                ) : (
                  <FiAlertCircle className="text-base shrink-0" />
                )}
                <span>{actionFeedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionFeedback(null)}
                className="p-1 rounded-lg hover:bg-black/5"
              >
                <FiX className="text-sm" />
              </button>
            </div>
          )}

          {/* Overdue Alert Banner */}
          {overdueCount > 0 && (
            <div className="bg-[#FFF3E0] border border-[#FF9800]/30 text-[#E65100] px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
              <FiAlertTriangle className="text-base text-[#F57C00] shrink-0" />
              <span>
                <strong>{overdueCount} {overdueCount === 1 ? "invoice is" : "invoices are"} overdue and unpaid</strong> ({formatCurrency(overdueAmount)} outstanding).
              </span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={loadVendorInvoices}
                className="bg-[#C62828] text-white px-3 py-1.5 rounded-xl font-bold hover:bg-[#B71C1C] transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Section 1: Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00B894] text-white flex items-center justify-center shadow-xs shrink-0">
                <FiFileText size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D3436] tracking-tight">
                  Earnings & Invoices
                </h1>
                <p className="text-xs text-[#817B77] font-medium">
                  Financial overview, billing, and invoice submissions
                </p>
              </div>
            </div>

            {/* Top-Right Controls */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Period Dropdown */}
              <div className="flex items-center gap-2 bg-white border border-[#EBE6E3] rounded-xl px-3 py-2 text-xs font-bold text-[#2D3436] shadow-2xs">
                <FiCalendar className="text-[#817B77] text-sm" />
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="bg-transparent outline-none text-xs font-bold text-[#2D3436] cursor-pointer"
                >
                  <option value="THIS_YEAR">This Year</option>
                  <option value="THIS_MONTH">This Month</option>
                  <option value="LAST_MONTH">Last Month</option>
                  <option value="ALL_TIME">All Time</option>
                </select>
              </div>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={invoices.length === 0}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  invoices.length > 0
                    ? "bg-white hover:bg-[#FAF7F5] text-[#2D3436] border border-[#EBE6E3]"
                    : "bg-white text-[#A09893] border border-[#EBE6E3] cursor-not-allowed"
                }`}
              >
                <FiDownload className="text-sm" />
                <span>Export</span>
              </button>

              {/* Raise Invoice Button */}
              <button
                type="button"
                onClick={() => handleOpenRaiseModal()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#928880] hover:bg-[#F7D8CF] text-white shadow-xs transition-all cursor-pointer"
              >
                <FiPlus className="text-sm" />
                <span>Raise Invoice</span>
              </button>
            </div>
          </div>

          {/* Section 2: Real Financial Summary Cards from Backend Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Invoiced */}
            <div className="bg-white rounded-2xl border border-[#EBE6E3] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#FCECE7] text-[#C87A65] flex items-center justify-center font-bold">
                  <FiDollarSign size={18} />
                </div>
                {statsData.drafts?.count > 0 && (
                  <span className="text-[10px] font-bold text-[#817B77] bg-[#FAF7F5] border border-[#F2EBE5] px-2 py-0.5 rounded-full">
                    {statsData.drafts.count} draft{statsData.drafts.count > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div>
                <div className="text-2xl font-black text-[#2D3436] tracking-tight">
                  {loading ? "..." : formatCurrency(totalInvoiced)}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">Total Invoiced</p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#FCECE7]/40 pointer-events-none" />
            </div>

            {/* Card 2: Awaiting Review */}
            <div className="bg-white rounded-2xl border border-[#EBE6E3] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold">
                  <FiClock size={18} />
                </div>
                <span className="text-[11px] font-bold text-[#817B77]">
                  {awaitingReviewCount} {awaitingReviewCount === 1 ? "invoice" : "invoices"}
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-[#2D3436] tracking-tight">
                  {loading ? "..." : formatCurrency(awaitingReviewAmount)}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">Awaiting Review</p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#FEF3C7]/40 pointer-events-none" />
            </div>

            {/* Card 3: Awaiting Payment */}
            <div className="bg-white rounded-2xl border border-[#EBE6E3] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#E3F2FD] text-[#1565C0] flex items-center justify-center font-bold">
                  <FiCheckCircle size={18} />
                </div>
                <span className="text-[11px] font-bold text-[#817B77]">
                  {awaitingPaymentCount} {awaitingPaymentCount === 1 ? "approved" : "approved"}
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-[#2D3436] tracking-tight">
                  {loading ? "..." : formatCurrency(awaitingPaymentAmount)}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">Awaiting Payment</p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#E3F2FD]/40 pointer-events-none" />
            </div>

            {/* Card 4: Paid Earnings */}
            <div className="bg-white rounded-2xl border border-[#EBE6E3] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold">
                  <FiDollarSign size={18} />
                </div>
                {paidThisMonthAmount > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#2E7D32] bg-[#E8F5E9] border border-[#2E7D32]/20 px-2 py-0.5 rounded-full">
                    <FiArrowUpRight size={11} />
                    {formatCurrency(paidThisMonthAmount)} mo
                  </span>
                )}
              </div>
              <div>
                <div className="text-2xl font-black text-[#2E7D32] tracking-tight">
                  {loading ? "..." : formatCurrency(paidEarningsAmount)}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">
                  Paid Earnings ({paidEarningsCount} paid)
                </p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#E8F5E9]/40 pointer-events-none" />
            </div>
          </div>

          {/* Section 3: Monthly Earnings Chart Component */}
          <MonthlyEarningsChart
            data={monthlyData}
            formatCurrency={formatCurrency}
          />

          {/* Section 4: Weekly Earnings Chart Component */}
          <WeeklyEarningsChart
            data={weeklyData}
          />

          {/* Section 5: Payout Summary Section */}
          <div className="bg-white rounded-2xl border border-[#EBE6E3] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#2D3436] mb-4">Payout Summary</h3>

            <div className="space-y-4">
              {/* Row 1: NEXT PAYOUT */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EBE6E3]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00B894]/10 text-[#00B894] flex items-center justify-center font-bold text-xs">
                    ↗
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-[#817B77] uppercase tracking-wider">
                      NEXT PAYOUT
                    </span>
                    <span className="text-base font-black text-[#2D3436]">
                      {formatCurrency(payoutSummary.nextPayout)}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#817B77]">{payoutSummary.nextDate}</span>
              </div>

              {/* Row 2: LAST PAYOUT */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EBE6E3]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center font-bold text-xs">
                    ↘
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-[#817B77] uppercase tracking-wider">
                      LAST PAYOUT
                    </span>
                    <span className="text-base font-black text-[#2D3436]">
                      {formatCurrency(payoutSummary.lastPayout)}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#817B77]">{payoutSummary.lastDate}</span>
              </div>

              {/* Row 3: AVG PAYOUT TIME */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E17055]/10 text-[#E17055] flex items-center justify-center font-bold text-xs">
                    🕒
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold text-[#817B77] uppercase tracking-wider">
                      AVG. PAYOUT TIME
                    </span>
                    <span className="text-base font-black text-[#2D3436]">
                      {payoutSummary.avgTime}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#817B77]">{payoutSummary.avgLabel}</span>
              </div>
            </div>
          </div>

          {/* Section 6: Payment History Table Component */}
          <PaymentHistoryTable
            invoices={invoices}
            loading={loading}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            onViewInvoice={handleViewInvoice}
            onEditInvoice={handleEditInvoice}
            onSubmitDraft={handleSubmitDraft}
            onDownloadPdf={handleDownloadPdf}
            downloadingId={downloadingId}
          />
        </main>
      </div>

      {/* Raise / Edit Invoice Modal */}
      <RaiseInvoiceModal
        isOpen={raiseModalOpen}
        onClose={() => {
          setRaiseModalOpen(false);
          setEditingInvoice(null);
          setRaiseProjectId(null);
        }}
        initialProjectId={raiseProjectId}
        existingInvoice={editingInvoice}
        onSuccess={handleInvoiceSuccess}
      />

      {/* Invoice Detail Modal */}
      <VendorInvoiceDetailModal
        isOpen={Boolean(viewingInvoice)}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
        onEditInvoice={handleEditInvoice}
        onSubmitDraft={handleSubmitDraft}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={downloadingId === viewingInvoice?._id}
        isSubmitting={isSubmittingDraft}
      />
    </div>
  );
};

export default Invoices;
