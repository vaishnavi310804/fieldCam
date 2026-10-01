import Project from "../project/project.model.js";
import Vendor from "../vendor/vendor.model.js";
import Invoice from "../invoice/invoice.model.js";
import AuditLog from "../audit/audit.model.js";

/**
 * Calculates real-time Admin Dashboard statistics, metrics, and data structures.
 * Strictly sources all metrics from MongoDB platform service database collections.
 */
export const getAdminDashboardData = async () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  // 1. Fetch all project documents
  const allProjects = await Project.find({}).lean();

  // Status counts (total)
  const newCount = allProjects.filter((p) => p.status === "New").length;
  const assignedCount = allProjects.filter((p) => p.status === "ASSIGNED").length;
  const inProgressCount = allProjects.filter(
    (p) => p.status === "In Progress" || p.status === "ASSIGNED"
  ).length;
  const underReviewCount = allProjects.filter(
    (p) => p.status === "Submitted" || p.status === "Under Review"
  ).length;
  const completedCount = allProjects.filter((p) => p.status === "Approved").length;

  // Current Month vs Last Month projects for Month-over-Month trends
  const newThisMonth = allProjects.filter(
    (p) => p.status === "New" && new Date(p.createdAt) >= startOfCurrentMonth
  ).length;
  const newLastMonth = allProjects.filter(
    (p) =>
      p.status === "New" &&
      new Date(p.createdAt) >= startOfLastMonth &&
      new Date(p.createdAt) <= endOfLastMonth
  ).length;

  const inProgThisMonth = allProjects.filter(
    (p) =>
      (p.status === "In Progress" || p.status === "ASSIGNED") &&
      new Date(p.updatedAt || p.createdAt) >= startOfCurrentMonth
  ).length;
  const inProgLastMonth = allProjects.filter(
    (p) =>
      (p.status === "In Progress" || p.status === "ASSIGNED") &&
      new Date(p.updatedAt || p.createdAt) >= startOfLastMonth &&
      new Date(p.updatedAt || p.createdAt) <= endOfLastMonth
  ).length;

  const reviewThisMonth = allProjects.filter(
    (p) =>
      (p.status === "Submitted" || p.status === "Under Review") &&
      new Date(p.updatedAt || p.createdAt) >= startOfCurrentMonth
  ).length;
  const reviewLastMonth = allProjects.filter(
    (p) =>
      (p.status === "Submitted" || p.status === "Under Review") &&
      new Date(p.updatedAt || p.createdAt) >= startOfLastMonth &&
      new Date(p.updatedAt || p.createdAt) <= endOfLastMonth
  ).length;

  const compThisMonth = allProjects.filter(
    (p) => p.status === "Approved" && new Date(p.updatedAt || p.createdAt) >= startOfCurrentMonth
  ).length;
  const compLastMonth = allProjects.filter(
    (p) =>
      p.status === "Approved" &&
      new Date(p.updatedAt || p.createdAt) >= startOfLastMonth &&
      new Date(p.updatedAt || p.createdAt) <= endOfLastMonth
  ).length;

  const calcMoM = (curr, prev) => {
    if (prev > 0) {
      const pct = Math.round(((curr - prev) / prev) * 100);
      return `${pct >= 0 ? "+" : ""}${pct}%`;
    }
    if (curr > 0) {
      return `+${curr} new`;
    }
    return "N/A";
  };

  const kpis = {
    newProjects: {
      count: newCount,
      change: calcMoM(newThisMonth, newLastMonth),
      timeframe: "vs last month",
      isPositive: newThisMonth >= newLastMonth,
    },
    inProgress: {
      count: inProgressCount,
      change: calcMoM(inProgThisMonth, inProgLastMonth),
      timeframe: "vs last month",
      isPositive: inProgThisMonth >= inProgLastMonth,
    },
    underReview: {
      count: underReviewCount,
      change: calcMoM(reviewThisMonth, reviewLastMonth),
      timeframe: "vs last month",
      isPositive: reviewThisMonth >= reviewLastMonth,
    },
    completed: {
      count: completedCount,
      change: calcMoM(compThisMonth, compLastMonth),
      timeframe: "vs last month",
      isPositive: compThisMonth >= compLastMonth,
    },
  };

  // 2. Revenue Aggregation from Paid/Approved Invoices
  const allInvoices = await Invoice.find({ status: { $in: ["Paid", "Approved"] } }).lean();
  const monthsList = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const revenueMap = {};
  monthsList.forEach((m) => (revenueMap[m] = 0));

  allInvoices.forEach((inv) => {
    const d = inv.paymentDate ? new Date(inv.paymentDate) : new Date(inv.createdAt);
    if (!isNaN(d.getTime())) {
      const mName = d.toLocaleDateString("en-US", { month: "short" });
      if (revenueMap[mName] !== undefined) {
        revenueMap[mName] += Number(inv.totalAmount || inv.amount || 0);
      }
    }
  });

  const monthlyEarnings = monthsList.map((m) => ({
    month: m,
    revenue: Number((revenueMap[m] / 1000).toFixed(1)),
  }));

  const hasInvoiceData = allInvoices.length > 0;

  // 3. Real Vendor Performance Scores
  const allVendors = await Vendor.find({}).lean();
  const vendorPerformance = allVendors
    .map((v) => {
      const vProjects = allProjects.filter(
        (p) => p.vendorId && p.vendorId.toString() === v._id.toString()
      );
      const approved = vProjects.filter((p) => p.status === "Approved").length;
      const evaluated = vProjects.filter(
        (p) => p.status === "Approved" || p.status === "Rejected"
      ).length;

      let score = 0;
      if (evaluated > 0) {
        score = Math.round((approved / evaluated) * 100);
      } else if (v.rating) {
        score = Math.round(v.rating * 20);
      }

      return {
        id: v._id,
        name: v.companyName || v.contactName || "Vendor",
        score,
        fill: score >= 80 ? "#C87A65" : score >= 70 ? "#8A817C" : "#A39A94",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  // 4. Real Recent Audit Log Activity
  const recentActivity = await AuditLog.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // 5. Real Recent Submissions
  const recentSubmissions = await Project.find({})
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(5)
    .populate("vendorId", "companyName contactName")
    .lean();

  return {
    kpis,
    monthlyEarnings,
    hasInvoiceData,
    expensesAvailable: false,
    vendorPerformance,
    recentActivity,
    recentSubmissions,
  };
};
