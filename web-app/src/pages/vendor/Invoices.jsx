import { useState, useEffect, useMemo } from "react";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import VendorHeader from "../../components/vendor/VendorHeader";
import { getInvoices } from "../../services/invoiceService";
import { getMyVendorProfile } from "../../services/vendorService";
import { useAuth } from "../../context/AuthContext";
import MonthlyEarningsChart from "../../components/vendor/invoices/MonthlyEarningsChart";
import WeeklyEarningsChart from "../../components/vendor/invoices/WeeklyEarningsChart";
import PaymentHistoryTable from "../../components/vendor/invoices/PaymentHistoryTable";
import {
  FiFileText,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiCalendar,
  FiTrendingDown,
  FiArrowUpRight,
} from "react-icons/fi";

const Invoices = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("THIS_YEAR"); // "THIS_YEAR" | "THIS_MONTH" | "LAST_MONTH" | "ALL_TIME"

  const [vendorProfile, setVendorProfile] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);

  const loadVendorInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vendorRes, invoiceRes] = await Promise.all([
        getMyVendorProfile().catch(() => null),
        getInvoices(),
      ]);

      if (vendorRes) {
        setVendorProfile(vendorRes.data || vendorRes);
      }

      const invoiceData = invoiceRes.data || invoiceRes || [];
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load vendor invoices from server"
      );
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorInvoices();
  }, []);

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

  // Filter invoices strictly by period
  const periodFilteredInvoices = useMemo(() => {
    return invoices.filter((inv) => isDateInPeriod(inv.createdAt, periodFilter));
  }, [invoices, periodFilter]);

  // Derive Financial Summaries strictly from periodFilteredInvoices
  const financialSummary = useMemo(() => {
    let totalEarnings = 0;
    let pendingPayments = 0;
    let paidThisMonth = 0;
    let paidLastMonth = 0;
    let overdueOrApproved = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    periodFilteredInvoices.forEach((inv) => {
      const total = Number(inv.totalAmount || inv.amount || 0);
      if (inv.status === "Paid") {
        totalEarnings += total;

        // Check if paid in current month vs last month
        if (inv.paymentDate) {
          const pDate = new Date(inv.paymentDate);
          if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
            paidThisMonth += total;
          } else if (pDate.getMonth() === lastMonth && pDate.getFullYear() === lastMonthYear) {
            paidLastMonth += total;
          }
        }
      } else if (inv.status === "Pending") {
        pendingPayments += total;
      } else if (inv.status === "Approved") {
        overdueOrApproved += total;
      }
    });

    // Real Paid This Month trend
    let paidThisMonthTrend = null;
    if (paidLastMonth > 0) {
      const diff = paidThisMonth - paidLastMonth;
      const sign = diff >= 0 ? "+" : "-";
      paidThisMonthTrend = `${sign}${formatCurrency(Math.abs(diff))} vs last`;
    } else if (paidThisMonth > 0) {
      paidThisMonthTrend = `+${formatCurrency(paidThisMonth)} vs last`;
    }

    const paidCount = periodFilteredInvoices.filter((i) => i.status === "Paid").length;
    const pendingCount = periodFilteredInvoices.filter((i) => i.status === "Pending").length;
    const approvedCount = periodFilteredInvoices.filter((i) => i.status === "Approved").length;

    return {
      totalEarnings,
      pendingPayments,
      paidThisMonth,
      paidThisMonthTrend,
      overdueOrApproved,
      paidCount,
      pendingCount,
      approvedCount,
    };
  }, [periodFilteredInvoices]);

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

    const nextPayoutAmount = approved.reduce((acc, i) => acc + Number(i.totalAmount || i.amount || 0), 0);
    const lastPayoutAmount = paid.length > 0 ? Number(paid[0].totalAmount || paid[0].amount || 0) : 0;
    const lastPayoutDate = paid.length > 0 ? formatDate(paid[0].paymentDate || paid[0].updatedAt) : "N/A";

    // Calculate avg turnaround days for paid invoices
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
    if (periodFilteredInvoices.length === 0) return;

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

    const rows = periodFilteredInvoices.map((inv) => [
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
    link.setAttribute(
      "download",
      `vendor_invoices_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const vendorDisplayName =
    vendorProfile?.companyName ||
    vendorProfile?.userId?.name ||
    user?.name ||
    "Vendor Partner";

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
          {/* Section 1: Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00B894] text-white flex items-center justify-center shadow-xs shrink-0">
                <FiFileText size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D3436] tracking-tight">
                  Earnings & Payments
                </h1>
                <p className="text-xs text-[#817B77] font-medium">
                  Financial overview for your vendor account
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
                disabled={periodFilteredInvoices.length === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  periodFilteredInvoices.length > 0
                    ? "bg-[#6C5CE7] text-white hover:bg-[#5B4BC4]"
                    : "bg-white text-[#A09893] border border-[#EBE6E3] cursor-not-allowed"
                }`}
              >
                <FiDownload className="text-sm" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Section 2: Financial Summary Cards (2x2 Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Total Earnings */}
            <div className="bg-white rounded-2xl border border-[#EBE6E3] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#00B894]/10 text-[#00B894] flex items-center justify-center font-bold">
                  <FiDollarSign size={18} />
                </div>
                {financialSummary.paidCount > 0 && (
                  <span className="text-[11px] font-bold text-[#817B77]">
                    {financialSummary.paidCount} {financialSummary.paidCount === 1 ? "paid invoice" : "paid invoices"}
                  </span>
                )}
              </div>
              <div>
                <div className="text-2xl font-black text-[#2D3436] tracking-tight">
                  {loading ? "..." : formatCurrency(financialSummary.totalEarnings)}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">Total Earnings</p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#00B894]/5 pointer-events-none" />
            </div>

            {/* Card 2: Pending Payments */}
            <div className="bg-white rounded-2xl border border-[#EBE6E3] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#E17055]/10 text-[#E17055] flex items-center justify-center font-bold">
                  <FiClock size={18} />
                </div>
                {financialSummary.pendingCount > 0 && (
                  <span className="text-[11px] font-bold text-[#817B77]">
                    {financialSummary.pendingCount} {financialSummary.pendingCount === 1 ? "invoice" : "invoices"}
                  </span>
                )}
              </div>
              <div>
                <div className="text-2xl font-black text-[#2D3436] tracking-tight">
                  {loading ? "..." : formatCurrency(financialSummary.pendingPayments)}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">Pending Payments</p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#E17055]/5 pointer-events-none" />
            </div>

            {/* Card 3: Paid This Month */}
            <div className="bg-white rounded-2xl border border-[#EBE6E3] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center font-bold">
                  <FiCheckCircle size={18} />
                </div>
                {financialSummary.paidThisMonthTrend && (
                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#00B894] bg-[#00B894]/10 px-2 py-0.5 rounded-full">
                    <FiArrowUpRight size={12} />
                    {financialSummary.paidThisMonthTrend}
                  </span>
                )}
              </div>
              <div>
                <div className="text-2xl font-black text-[#2D3436] tracking-tight">
                  {loading ? "..." : formatCurrency(financialSummary.paidThisMonth)}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">Paid This Month</p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#6C5CE7]/5 pointer-events-none" />
            </div>

            {/* Card 4: Overdue */}
            <div className="bg-white rounded-2xl border border-[#EBE6E3] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#D63031]/10 text-[#D63031] flex items-center justify-center font-bold">
                  <FiTrendingDown size={18} />
                </div>
                {financialSummary.approvedCount > 0 && (
                  <span className="text-[11px] font-bold text-[#817B77]">
                    {financialSummary.approvedCount} {financialSummary.approvedCount === 1 ? "invoice" : "invoices"}
                  </span>
                )}
              </div>
              <div>
                <div className="text-2xl font-black text-[#2D3436] tracking-tight">
                  {loading ? "..." : formatCurrency(financialSummary.overdueOrApproved)}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">Overdue</p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#D63031]/5 pointer-events-none" />
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
            invoices={periodFilteredInvoices}
            loading={loading}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </main>
      </div>
    </div>
  );
};

export default Invoices;
