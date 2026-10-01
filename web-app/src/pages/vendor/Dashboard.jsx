import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import VendorHeader from "../../components/vendor/VendorHeader";
import ProjectStatusBadge from "../../components/admin/projects/ProjectStatusBadge";
import { getMyVendorProfile } from "../../services/vendorService";
import { getProjects } from "../../services/projectService";
import { getInvoices } from "../../services/invoiceService";
import { useAuth } from "../../context/AuthContext";
import {
  FiFolder,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiBriefcase,
  FiDollarSign,
  FiAlertCircle,
  FiLoader,
  FiRefreshCw,
  FiArrowRight,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [vendorProfile, setVendorProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVendorDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch live authenticated vendor profile
      const vendorRes = await getMyVendorProfile();
      const profileData = vendorRes.data || vendorRes;
      setVendorProfile(profileData);

      // 2. Fetch live vendor-scoped projects & invoices in parallel
      const [projRes, invRes] = await Promise.all([
        getProjects(),
        getInvoices(),
      ]);

      setProjects(projRes.data || projRes || []);
      setInvoices(invRes.data || invRes || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load vendor dashboard from backend"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorDashboardData();
  }, []);

  // Filter projects by search term
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    const q = searchTerm.toLowerCase();
    return projects.filter(
      (p) =>
        (p.projectId || "").toLowerCase().includes(q) ||
        (p.projectName || "").toLowerCase().includes(q) ||
        (p.location || "").toLowerCase().includes(q)
    );
  }, [projects, searchTerm]);

  // Derive Summary Counts strictly from REAL backend project data
  const newProjectsCount = projects.filter((p) => p.status === "New").length;
  const inProgressCount = projects.filter((p) => p.status === "In Progress").length;
  const submittedCount = projects.filter(
    (p) => p.status === "Submitted" || p.status === "Under Review"
  ).length;
  const completedCount = projects.filter((p) => p.status === "Approved").length;

  // Process Real Invoice Monthly Revenue for Earnings Overview Chart
  const monthlyEarningsData = useMemo(() => {
    const paidInvoices = invoices.filter((i) => i.status === "Paid");
    if (paidInvoices.length === 0) return [];

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const totalsByMonth = {};
    paidInvoices.forEach((inv) => {
      const date = new Date(inv.paymentDate || inv.createdAt);
      if (!isNaN(date.getTime())) {
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        totalsByMonth[key] = (totalsByMonth[key] || 0) + (inv.totalAmount || inv.amount || 0);
      }
    });

    return Object.entries(totalsByMonth).map(([month, amount]) => ({
      month,
      amount,
    }));
  }, [invoices]);

  const maxEarningAmount = useMemo(() => {
    if (monthlyEarningsData.length === 0) return 1000;
    const max = Math.max(...monthlyEarningsData.map((d) => d.amount));
    return max > 0 ? max : 1000;
  }, [monthlyEarningsData]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const calculateProgress = (proj) => {
    const statusUpper = (proj?.status || "").toUpperCase();
    if (statusUpper === "NEW" || statusUpper === "ASSIGNED") return null;
    if (proj.status === "Approved") return 100;
    if (Array.isArray(proj.checklistItems) && proj.checklistItems.length > 0) {
      const checked = proj.checklistItems.filter((i) => i.checked).length;
      return Math.round((checked / proj.checklistItems.length) * 100);
    }
    if (proj.status === "In Progress") return 50;
    if (proj.status === "Submitted" || proj.status === "Under Review") return 85;
    return null;
  };

  const vendorDisplayName =
    vendorProfile?.companyName ||
    vendorProfile?.userId?.name ||
    user?.name ||
    "Vendor Partner";

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      {/* Sidebar */}
      <VendorSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Header */}
        <VendorHeader
          vendorName={vendorDisplayName}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Main Dashboard Body */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Error Banner */}
          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadVendorDashboardData}
                className="flex items-center gap-1.5 bg-[#C62828] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#B71C1C] transition-colors cursor-pointer"
              >
                <FiRefreshCw className="text-xs" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-12 text-center text-xs text-[#817B77] space-y-2">
              <FiLoader className="animate-spin text-2xl mx-auto text-[#8A817C]" />
              <p className="font-semibold">Loading your real vendor statistics from backend...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* 1. Metric Summary Cards (4 Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: New Projects */}
                <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] text-[#1976D2] flex items-center justify-center font-bold text-base shadow-xs">
                      <FiFolder />
                    </div>
                    <span className="text-[10px] font-bold text-[#817B77] bg-[#FAF7F5] px-2 py-0.5 rounded-full border border-[#F2EBE5]">
                      Live Count
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#3E3734]">{newProjectsCount}</h3>
                    <p className="text-xs font-semibold text-[#817B77] mt-0.5">New Projects</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-[#1976D2]/5 absolute -right-3 -bottom-3 pointer-events-none" />
                </div>

                {/* Card 2: In Progress */}
                <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] text-[#ED6C02] flex items-center justify-center font-bold text-base shadow-xs">
                      <FiClock />
                    </div>
                    <span className="text-[10px] font-bold text-[#817B77] bg-[#FAF7F5] px-2 py-0.5 rounded-full border border-[#F2EBE5]">
                      Active
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#3E3734]">{inProgressCount}</h3>
                    <p className="text-xs font-semibold text-[#817B77] mt-0.5">In Progress</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-[#ED6C02]/5 absolute -right-3 -bottom-3 pointer-events-none" />
                </div>

                {/* Card 3: Submitted */}
                <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#F3E5F5] text-[#9C27B0] flex items-center justify-center font-bold text-base shadow-xs">
                      <FiSend />
                    </div>
                    <span className="text-[10px] font-bold text-[#817B77] bg-[#FAF7F5] px-2 py-0.5 rounded-full border border-[#F2EBE5]">
                      In Review
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#3E3734]">{submittedCount}</h3>
                    <p className="text-xs font-semibold text-[#817B77] mt-0.5">Submitted</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-[#9C27B0]/5 absolute -right-3 -bottom-3 pointer-events-none" />
                </div>

                {/* Card 4: Completed */}
                <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold text-base shadow-xs">
                      <FiCheckCircle />
                    </div>
                    <span className="text-[10px] font-bold text-[#817B77] bg-[#FAF7F5] px-2 py-0.5 rounded-full border border-[#F2EBE5]">
                      Approved
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#3E3734]">{completedCount}</h3>
                    <p className="text-xs font-semibold text-[#817B77] mt-0.5">Completed</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-[#2E7D32]/5 absolute -right-3 -bottom-3 pointer-events-none" />
                </div>
              </div>

              {/* 2. Earnings Overview Chart Section */}
              <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-[#3E3734]">Earnings Overview</h2>
                    <p className="text-xs text-[#817B77] mt-0.5">
                      Monthly revenue trend based on paid invoices
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-[#817B77]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5141F5]" />
                      <span>Paid Earnings ($)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C8B5AC]" />
                      <span>Projects Count</span>
                    </div>
                  </div>
                </div>

                {monthlyEarningsData.length > 0 ? (
                  <div className="h-52 w-full pt-4 flex items-end justify-between gap-3 px-2">
                    {monthlyEarningsData.map((item, idx) => {
                      const heightPercent = Math.max(
                        10,
                        Math.round((item.amount / maxEarningAmount) * 100)
                      );

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                          <span className="text-[10px] font-bold text-[#5141F5] opacity-0 group-hover:opacity-100 transition-opacity">
                            ${item.amount.toLocaleString()}
                          </span>
                          <div className="w-full bg-[#FAF7F5] rounded-xl overflow-hidden h-36 flex items-end p-1 border border-[#F2EBE5]">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full bg-gradient-to-t from-[#5141F5] to-[#8B7CFF] rounded-lg transition-all duration-500 shadow-xs"
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-[#817B77]">
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-[#FAF7F5] border border-dashed border-[#E8E2DE] rounded-xl p-8 text-center text-xs text-[#817B77] space-y-1">
                    <FiDollarSign className="text-2xl mx-auto text-[#A39A94]" />
                    <p className="font-semibold text-[#3E3734]">No Earnings Record Available Yet</p>
                    <p>Paid invoices will generate monthly revenue trend visualization automatically.</p>
                  </div>
                )}
              </div>

              {/* 3. Recent Projects Card */}
              <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-[#3E3734]">Recent Projects</h2>
                    <p className="text-xs text-[#817B77] mt-0.5">Latest field assignments</p>
                  </div>

                  <Link
                    to="/admin/projects"
                    className="text-xs font-bold text-[#5141F5] hover:text-[#4535E8] flex items-center gap-1 transition-colors"
                  >
                    <span>View All</span>
                    <FiArrowRight className="text-xs" />
                  </Link>
                </div>

                {filteredProjects.length > 0 ? (
                  <div className="space-y-3">
                    {filteredProjects.slice(0, 5).map((proj) => {
                      const progressVal = calculateProgress(proj);

                      return (
                        <div
                          key={proj._id || proj.projectId}
                          className="bg-[#FAF7F5] border border-[#E8E2DE] hover:border-[#C8B5AC] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs"
                        >
                          {/* Project Details */}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-[#817B77] bg-white border border-[#E8E2DE] px-2 py-0.5 rounded">
                                {proj.projectId}
                              </span>
                              <ProjectStatusBadge status={proj.status} />
                            </div>

                            <h3 className="text-xs font-bold text-[#3E3734] truncate">
                              {proj.projectName}
                            </h3>

                            <div className="flex items-center gap-3 text-[11px] text-[#817B77]">
                              <span className="flex items-center gap-1">
                                <FiMapPin className="text-xs shrink-0" />
                                <span className="truncate">{proj.location || "N/A"}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <FiCalendar className="text-xs shrink-0" />
                                <span>{formatDate(proj.deadline || proj.createdAt)}</span>
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar Display */}
                          <div className="sm:w-36 flex flex-col items-end gap-1 shrink-0">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-[#3E3734]">
                              <span className="text-[#817B77]">Progress</span>
                              <span>{progressVal}%</span>
                            </div>

                            <div className="w-full bg-[#E8E2DE] h-2 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${progressVal}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${
                                  progressVal === 100
                                    ? "bg-[#2E7D32]"
                                    : progressVal > 50
                                    ? "bg-[#5141F5]"
                                    : "bg-[#ED6C02]"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-[#FAF7F5] border border-dashed border-[#E8E2DE] rounded-xl p-8 text-center text-xs text-[#817B77] space-y-1">
                    <FiBriefcase className="text-2xl mx-auto text-[#A39A94]" />
                    <p className="font-semibold text-[#3E3734]">No Projects Assigned</p>
                    <p>When projects are assigned to your vendor account, they will appear here.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default VendorDashboard;
