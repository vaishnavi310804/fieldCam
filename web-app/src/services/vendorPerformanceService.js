import platformApi from "./api";

/**
 * Fetches vendor-scoped projects and calculates performance analytics datasets.
 * Backend automatically filters projects by logged-in vendor identity from JWT (req.user.id).
 */
export const getVendorPerformanceData = async (params) => {
  const response = await platformApi.get("/projects", { params });

  // Extract array from Express JSON response ({ success: true, count: N, data: [...] })
  const resBody = response?.data;
  const projectArray = Array.isArray(resBody?.data)
    ? resBody.data
    : Array.isArray(resBody)
    ? resBody
    : [];

  return processPerformanceMetrics(projectArray);
};

export const processPerformanceMetrics = (rawProjects = []) => {
  const projects = Array.isArray(rawProjects) ? rawProjects : [];
  let completed = 0;
  let rejected = 0;
  let submitted = 0;
  let inProgress = 0;
  let newCount = 0;

  let totalTurnaroundMs = 0;
  let turnaroundCount = 0;

  const rejectionReasonMap = {};
  const workTypeMap = {};

  projects.forEach((p) => {
    if (p.status === "Approved") {
      completed += 1;
      if (p.createdAt && p.updatedAt) {
        const start = new Date(p.createdAt).getTime();
        const end = new Date(p.updatedAt).getTime();
        if (end > start) {
          totalTurnaroundMs += end - start;
          turnaroundCount += 1;
        }
      }
    } else if (p.status === "Rejected") {
      rejected += 1;
      if (p.rejectionReason && p.rejectionReason.trim()) {
        const reason = p.rejectionReason.trim();
        rejectionReasonMap[reason] = (rejectionReasonMap[reason] || 0) + 1;
      }
    } else if (p.status === "Submitted" || p.status === "Under Review") {
      submitted += 1;
    } else if (p.status === "In Progress") {
      inProgress += 1;
    } else if (p.status === "New") {
      newCount += 1;
    }

    if (p.serviceTypeName && p.serviceTypeName.trim()) {
      const typeName = p.serviceTypeName.trim();
      workTypeMap[typeName] = (workTypeMap[typeName] || 0) + 1;
    }
  });

  const totalReviewed = completed + rejected;
  const approvalRate =
    totalReviewed > 0
      ? Number(((completed / totalReviewed) * 100).toFixed(1))
      : null;

  const avgTurnaroundDays =
    turnaroundCount > 0
      ? Number((totalTurnaroundMs / (1000 * 60 * 60 * 24) / turnaroundCount).toFixed(1))
      : null;

  const months = [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
  ];

  const monthlyStats = months.map((m) => ({
    month: m,
    completed: 0,
    submitted: 0,
    rejected: 0,
    turnaroundTotalMs: 0,
    turnaroundCount: 0,
  }));

  const monthIdxMap = {
    Apr: 0,
    May: 1,
    Jun: 2,
    Jul: 3,
    Aug: 4,
    Sep: 5,
    Oct: 6,
    Nov: 7,
    Dec: 8,
    Jan: 9,
    Feb: 10,
    Mar: 11,
  };

  projects.forEach((p) => {
    const d = p.updatedAt
      ? new Date(p.updatedAt)
      : p.createdAt
      ? new Date(p.createdAt)
      : null;

    if (d && !isNaN(d.getTime())) {
      const mName = d.toLocaleDateString("en-US", { month: "short" });
      const idx = monthIdxMap[mName];
      if (idx !== undefined) {
        if (p.status === "Approved") {
          monthlyStats[idx].completed += 1;
          if (p.createdAt && p.updatedAt) {
            const diff =
              new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime();
            if (diff > 0) {
              monthlyStats[idx].turnaroundTotalMs += diff;
              monthlyStats[idx].turnaroundCount += 1;
            }
          }
        } else if (p.status === "Rejected") {
          monthlyStats[idx].rejected += 1;
        } else if (p.status === "Submitted" || p.status === "Under Review") {
          monthlyStats[idx].submitted += 1;
        }
      }
    }
  });

  const monthlyCompletionData = monthlyStats.map((m) => ({
    month: m.month,
    completed: m.completed,
    submitted: m.submitted + m.completed,
    rejected: m.rejected,
  }));

  const approvalRateTrendData = monthlyStats.map((m) => {
    const rev = m.completed + m.rejected;
    return {
      month: m.month,
      rate: rev > 0 ? Number(((m.completed / rev) * 100).toFixed(1)) : null,
    };
  });

  const completionTimeData = monthlyStats.map((m) => ({
    month: m.month,
    days:
      m.turnaroundCount > 0
        ? Number(
            (m.turnaroundTotalMs / (1000 * 60 * 60 * 24) / m.turnaroundCount).toFixed(1)
          )
        : null,
  }));

  const rejectionReasonsList = Object.keys(rejectionReasonMap)
    .map((reason) => ({
      reason,
      count: rejectionReasonMap[reason],
      percentage:
        rejected > 0
          ? Math.round((rejectionReasonMap[reason] / rejected) * 100)
          : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const workTypesList = Object.keys(workTypeMap)
    .map((typeName) => ({
      name: typeName,
      count: workTypeMap[typeName],
      percentage:
        projects.length > 0
          ? Math.round((workTypeMap[typeName] / projects.length) * 100)
          : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const statusBreakdown = [
    { name: "Approved", value: completed, fill: "#10B981" },
    { name: "Rejected", value: rejected, fill: "#EF4444" },
    { name: "Submitted", value: submitted, fill: "#3B82F6" },
    { name: "In Progress", value: inProgress, fill: "#F59E0B" },
    { name: "New", value: newCount, fill: "#8B5CF6" },
  ].filter((s) => s.value > 0);

  return {
    summary: {
      completed,
      rejected,
      submitted: submitted + completed + rejected,
      inProgress,
      totalProjects: projects.length,
      approvalRate,
      avgTurnaroundDays,
    },
    monthlyCompletionData,
    approvalRateTrendData,
    completionTimeData,
    statusBreakdown,
    rejectionReasonsList,
    workTypesList,
  };
};
