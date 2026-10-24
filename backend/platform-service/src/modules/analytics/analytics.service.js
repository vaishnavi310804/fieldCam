import Project from "../project/project.model.js";
import Vendor from "../vendor/vendor.model.js";
import Invoice from "../invoice/invoice.model.js";
import AuditLog from "../audit/audit.model.js";

const MONTH_NAMES = [
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

const REJECTION_BAR_COLORS = [
  "bg-[#E07A5F]",
  "bg-[#C87A65]",
  "bg-[#D97706]",
  "bg-[#8A817C]",
  "bg-[#A39A94]",
  "bg-[#D5C9C2]",
];

const SERVICE_COLORS = [
  "#C87A65",
  "#5B67CA",
  "#8A817C",
  "#7C3AED",
  "#10B981",
  "#D97706",
  "#3B82F6",
  "#EC4899",
];

export const getAdminAnalyticsData = async () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  // 1. Fetch all authoritative data in parallel
  const [allProjects, allVendors, allPaidInvoices, submissionAuditLogs] = await Promise.all([
    Project.find({}).lean(),
    Vendor.find({}).lean(),
    Invoice.find({ status: "Paid" }).lean(),
    AuditLog.find({ action: "PROJECT_SUBMITTED" }).lean().catch(() => []),
  ]);

  // Index submission audit events by projectId and entityId for accurate submission timestamps
  const submissionTimeMap = new Map();
  submissionAuditLogs.forEach((log) => {
    const time = new Date(log.createdAt);
    if (log.metadata?.projectId) {
      submissionTimeMap.set(String(log.metadata.projectId), time);
    }
    if (log.entityId) {
      submissionTimeMap.set(String(log.entityId), time);
    }
  });

  // ==========================================
  // 2. KPI METRICS
  // ==========================================

  // A. Total Vendors
  const totalVendors = allVendors.length;
  const vendorsCreatedThisMonth = allVendors.filter(
    (v) => v.createdAt && new Date(v.createdAt) >= startOfCurrentMonth
  ).length;
  const vendorsCreatedLastMonth = allVendors.filter(
    (v) =>
      v.createdAt &&
      new Date(v.createdAt) >= startOfLastMonth &&
      new Date(v.createdAt) <= endOfLastMonth
  ).length;

  const calcVendorMoM = (curr, prev) => {
    if (prev > 0) {
      const diff = curr - prev;
      const pct = Math.round((diff / prev) * 100);
      return {
        change: `${pct >= 0 ? "+" : ""}${pct}% vs last month`,
        isPositive: pct >= 0,
        isNeutral: false,
      };
    }
    if (curr > 0) {
      return {
        change: `+${curr} vs last month`,
        isPositive: true,
        isNeutral: false,
      };
    }
    if (totalVendors > 0) {
      return {
        change: "0 vs last month",
        isPositive: true,
        isNeutral: true,
      };
    }
    return {
      change: "N/A",
      isPositive: null,
      isNeutral: true,
    };
  };

  const totalVendorsMoM = calcVendorMoM(vendorsCreatedThisMonth, vendorsCreatedLastMonth);

  // B. Active Vendors
  const activeVendorsList = allVendors.filter(
    (v) => (v.status || "").toLowerCase() === "active"
  );
  const activeVendorsCount = activeVendorsList.length;

  const activeCreatedThisMonth = activeVendorsList.filter(
    (v) => v.createdAt && new Date(v.createdAt) >= startOfCurrentMonth
  ).length;
  const activeCreatedLastMonth = activeVendorsList.filter(
    (v) =>
      v.createdAt &&
      new Date(v.createdAt) >= startOfLastMonth &&
      new Date(v.createdAt) <= endOfLastMonth
  ).length;

  const activeVendorsMoM = calcVendorMoM(activeCreatedThisMonth, activeCreatedLastMonth);

  // C. Average Completion Time (strictly Completed status, valid start & end timestamps)
  const completedProjects = allProjects.filter((p) => p.status === "Completed");

  let totalCompletionDays = 0;
  let validCompletedCount = 0;

  let totalDaysThisMonth = 0;
  let countThisMonth = 0;

  let totalDaysLastMonth = 0;
  let countLastMonth = 0;

  completedProjects.forEach((p) => {
    const startDate = p.acceptedAt
      ? new Date(p.acceptedAt)
      : p.createdAt
      ? new Date(p.createdAt)
      : null;
    const endDate = p.updatedAt ? new Date(p.updatedAt) : null;

    if (
      startDate &&
      endDate &&
      !isNaN(startDate.getTime()) &&
      !isNaN(endDate.getTime()) &&
      endDate.getTime() >= startDate.getTime()
    ) {
      const durationDays =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      totalCompletionDays += durationDays;
      validCompletedCount += 1;

      if (endDate >= startOfCurrentMonth) {
        totalDaysThisMonth += durationDays;
        countThisMonth += 1;
      } else if (endDate >= startOfLastMonth && endDate <= endOfLastMonth) {
        totalDaysLastMonth += durationDays;
        countLastMonth += 1;
      }
    }
  });

  const avgCompletionDays =
    validCompletedCount > 0 ? totalCompletionDays / validCompletedCount : null;
  const avgThisMonth = countThisMonth > 0 ? totalDaysThisMonth / countThisMonth : null;
  const avgLastMonth = countLastMonth > 0 ? totalDaysLastMonth / countLastMonth : null;

  let completionMoM = {
    change: "N/A",
    isPositive: null,
    isNeutral: true,
  };

  if (avgThisMonth !== null && avgLastMonth !== null) {
    const diff = avgThisMonth - avgLastMonth;
    completionMoM = {
      change: `${diff <= 0 ? "" : "+"}${diff.toFixed(1)}d vs last month`,
      isPositive: diff <= 0, // Lower turnaround is positive
      isNeutral: false,
    };
  }

  // D. Average Approval Score
  // FieldCam schema does not persist an approvalScore or reviewScore field.
  // Report honest unavailable state per requirements.
  const approvalScoreData = {
    value: "N/A",
    change: "N/A",
    isPositive: null,
    isNeutral: true,
    isAvailable: false,
    reason: "No review scores persisted in current schema",
  };

  const kpis = {
    totalVendors: {
      value: String(totalVendors),
      change: totalVendorsMoM.change,
      isPositive: totalVendorsMoM.isPositive,
      isNeutral: totalVendorsMoM.isNeutral,
    },
    activeVendors: {
      value: String(activeVendorsCount),
      change: activeVendorsMoM.change,
      isPositive: activeVendorsMoM.isPositive,
      isNeutral: activeVendorsMoM.isNeutral,
    },
    avgCompletionTime: {
      value: avgCompletionDays !== null ? `${avgCompletionDays.toFixed(1)}d` : "N/A",
      change: completionMoM.change,
      isPositive: completionMoM.isPositive,
      isNeutral: completionMoM.isNeutral,
      isAvailable: avgCompletionDays !== null,
    },
    avgApprovalScore: approvalScoreData,
  };

  // ==========================================
  // 3. MONTHLY TIMEFRAME (Rolling 9-12 months)
  // ==========================================
  const rollingMonths = [];
  const MONTHS_WINDOW = 12;

  for (let i = MONTHS_WINDOW - 1; i >= 0; i--) {
    const start = new Date(currentYear, currentMonth - i, 1);
    const end = new Date(currentYear, currentMonth - i + 1, 0, 23, 59, 59, 999);
    const mLabel = MONTH_NAMES[start.getMonth()];

    rollingMonths.push({
      month: mLabel,
      year: start.getFullYear(),
      monthIndex: start.getMonth(),
      start,
      end,
    });
  }

  // Monthly Projects Counts (Submitted vs strictly Completed)
  const monthlyProjects = rollingMonths.map(({ month, year, start, end }) => {
    const submittedCount = allProjects.filter((p) => {
      // Must have reached submission or review lifecycle
      const isEligibleStatus = [
        "Submitted",
        "Under Review",
        "Approved",
        "Completed",
        "Rejected",
      ].includes(p.status);
      if (!isEligibleStatus) return false;

      const subTime =
        submissionTimeMap.get(p.projectId) ||
        submissionTimeMap.get(String(p._id)) ||
        (p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt));

      return subTime >= start && subTime <= end;
    }).length;

    const completedCount = allProjects.filter((p) => {
      if (p.status !== "Completed") return false;
      const compTime = p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt);
      return compTime >= start && compTime <= end;
    }).length;

    return {
      month,
      year,
      submitted: submittedCount,
      completed: completedCount,
    };
  });

  // ==========================================
  // 4. REVENUE ANALYTICS (Paid Invoices Only)
  // ==========================================
  const revenueAnalyticsSeries = rollingMonths.map(({ month, year, start, end }) => {
    const monthRevenue = allPaidInvoices
      .filter((inv) => {
        const d = inv.paymentDate ? new Date(inv.paymentDate) : new Date(inv.createdAt);
        return d >= start && d <= end;
      })
      .reduce(
        (sum, inv) => sum + Number(inv.totalAmount || inv.amount || 0),
        0
      );

    return {
      month,
      year,
      revenue: Math.round(monthRevenue),
    };
  });

  // Calculate Revenue MoM / YoY Trend
  const currMonthRev =
    revenueAnalyticsSeries[revenueAnalyticsSeries.length - 1]?.revenue || 0;
  const prevMonthRev =
    revenueAnalyticsSeries[revenueAnalyticsSeries.length - 2]?.revenue || 0;

  let revenueTrend = {
    badge: "N/A",
    isPositive: null,
    isNeutral: true,
  };

  if (prevMonthRev > 0) {
    const diff = currMonthRev - prevMonthRev;
    const pct = Math.round((diff / prevMonthRev) * 100);
    revenueTrend = {
      badge: `${pct >= 0 ? "+" : ""}${pct}% MoM`,
      isPositive: pct >= 0,
      isNeutral: false,
    };
  } else if (currMonthRev > 0) {
    revenueTrend = {
      badge: "+100% MoM",
      isPositive: true,
      isNeutral: false,
    };
  }

  // ==========================================
  // 5. VENDOR APPROVAL RATE CHART
  // ==========================================
  const vendorApprovalRates = allVendors.map((v) => {
    const vProjects = allProjects.filter(
      (p) => p.vendorId && String(p.vendorId) === String(v._id)
    );

    const approvedCount = vProjects.filter(
      (p) => p.status === "Approved" || p.status === "Completed"
    ).length;
    const rejectedCount = vProjects.filter((p) => p.status === "Rejected").length;
    const evaluatedCount = approvedCount + rejectedCount;

    const score =
      evaluatedCount > 0
        ? Math.round((approvedCount / evaluatedCount) * 100)
        : 0;

    let fill = "#D5C9C2"; // neutral gray for no reviews
    if (evaluatedCount > 0) {
      if (score >= 80) fill = "#10B981"; // green
      else if (score >= 65) fill = "#F59E0B"; // amber
      else fill = "#EF4444"; // red
    }

    return {
      id: v._id,
      name: v.companyName || v.contactName || "Vendor",
      score,
      evaluatedCount,
      approvedCount,
      rejectedCount,
      totalProjects: vProjects.length,
      hasReviews: evaluatedCount > 0,
      fill,
    };
  });

  // Sort vendors: reviewed vendors first by score descending, then by evaluatedCount
  vendorApprovalRates.sort((a, b) => {
    if (a.hasReviews && !b.hasReviews) return -1;
    if (!a.hasReviews && b.hasReviews) return 1;
    if (b.score !== a.score) return b.score - a.score;
    return b.evaluatedCount - a.evaluatedCount;
  });

  // Limit to top 8 vendors for layout consistency
  const displayedVendorApproval = vendorApprovalRates.slice(0, 8);

  // ==========================================
  // 6. REJECTION REASONS BREAKDOWN
  // ==========================================
  const rejectionCountMap = {};
  let totalRejectionsCount = 0;

  allProjects.forEach((p) => {
    if (p.status === "Rejected" || (p.rejectionReason && p.rejectionReason.trim())) {
      const reason = (p.rejectionReason && p.rejectionReason.trim()) || "Unspecified";
      rejectionCountMap[reason] = (rejectionCountMap[reason] || 0) + 1;
      totalRejectionsCount += 1;
    }
  });

  const rejectionReasons = Object.keys(rejectionCountMap)
    .map((reason, idx) => {
      const count = rejectionCountMap[reason];
      const pctNum =
        totalRejectionsCount > 0
          ? Math.round((count / totalRejectionsCount) * 100)
          : 0;
      return {
        reason,
        count,
        percentage: `${pctNum}%`,
        width: `${pctNum}%`,
        barColor: REJECTION_BAR_COLORS[idx % REJECTION_BAR_COLORS.length],
      };
    })
    .sort((a, b) => b.count - a.count);

  // ==========================================
  // 7. SERVICE BREAKDOWN CHART
  // ==========================================
  const serviceCountMap = {};
  const totalProjectsCount = allProjects.length;

  allProjects.forEach((p) => {
    const serviceName =
      (p.serviceTypeName && p.serviceTypeName.trim()) || "Uncategorized";
    serviceCountMap[serviceName] = (serviceCountMap[serviceName] || 0) + 1;
  });

  const serviceBreakdown = Object.keys(serviceCountMap)
    .map((name, idx) => {
      const count = serviceCountMap[name];
      const pctNum =
        totalProjectsCount > 0
          ? Math.round((count / totalProjectsCount) * 100)
          : 0;
      return {
        name,
        count,
        value: pctNum,
        color: SERVICE_COLORS[idx % SERVICE_COLORS.length],
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    kpis,
    monthlyProjects,
    revenueAnalytics: {
      series: revenueAnalyticsSeries,
      trend: revenueTrend,
    },
    vendorApprovalRates: displayedVendorApproval,
    rejectionReasons: {
      items: rejectionReasons,
      totalRejections: totalRejectionsCount,
    },
    serviceBreakdown: {
      items: serviceBreakdown,
      totalProjects: totalProjectsCount,
    },
    meta: {
      generatedAt: now.toISOString(),
      timeframeMonths: MONTHS_WINDOW,
    },
  };
};
