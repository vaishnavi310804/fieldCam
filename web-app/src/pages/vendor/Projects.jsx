import { useState, useEffect, useMemo } from "react";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import VendorHeader from "../../components/vendor/VendorHeader";
import VendorProjectCard from "../../components/vendor/VendorProjectCard";
import { getProjects } from "../../services/projectService";
import { getMyVendorProfile } from "../../services/vendorService";
import { useAuth } from "../../context/AuthContext";
import {
  FiSearch,
  FiFilter,
  FiAlertCircle,
  FiRefreshCw,
  FiBriefcase,
  FiSliders,
} from "react-icons/fi";

const Projects = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate"); // "dueDate" | "newest" | "title"

  const [vendorProfile, setVendorProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVendorProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch authenticated vendor profile and vendor-scoped projects in parallel
      const [vendorRes, projRes] = await Promise.all([
        getMyVendorProfile().catch(() => null),
        getProjects(),
      ]);

      if (vendorRes) {
        setVendorProfile(vendorRes.data || vendorRes);
      }
      setProjects(projRes.data || projRes || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load vendor projects from server"
      );
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorProjects();
  }, []);

  // Helper to check if a project is overdue
  const isProjectOverdue = (project) => {
    if (!project.deadline) return false;
    const deadlineDate = new Date(project.deadline);
    if (isNaN(deadlineDate.getTime())) return false;
    return deadlineDate < new Date() && project.status !== "Approved";
  };

  // Derive dynamic counts for status filter pills strictly from REAL project data
  const filterCounts = useMemo(() => {
    const counts = {
      All: projects.length,
      New: 0,
      "In Progress": 0,
      Submitted: 0,
      Completed: 0,
      Overdue: 0,
    };

    projects.forEach((p) => {
      if (p.status === "New") counts.New += 1;
      if (p.status === "In Progress") counts["In Progress"] += 1;
      if (p.status === "Submitted" || p.status === "Under Review") counts.Submitted += 1;
      if (p.status === "Approved") counts.Completed += 1;
      if (isProjectOverdue(p)) counts.Overdue += 1;
    });

    return counts;
  }, [projects]);

  // Filter and Sort Projects
  const processedProjects = useMemo(() => {
    let result = [...projects];

    // 1. Filter by Status Pill
    if (activeFilter !== "All") {
      result = result.filter((p) => {
        if (activeFilter === "New") return p.status === "New";
        if (activeFilter === "In Progress") return p.status === "In Progress";
        if (activeFilter === "Submitted") return p.status === "Submitted" || p.status === "Under Review";
        if (activeFilter === "Completed") return p.status === "Approved";
        if (activeFilter === "Overdue") return isProjectOverdue(p);
        return true;
      });
    }

    // 2. Filter by Search Query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((p) => {
        const pId = (p.projectId || p._id || "").toLowerCase();
        const pName = (p.projectName || "").toLowerCase();
        const loc = (p.location || "").toLowerCase();
        const sType = (p.serviceTypeName || p.serviceId?.serviceTypeName || "").toLowerCase();
        return (
          pId.includes(q) ||
          pName.includes(q) ||
          loc.includes(q) ||
          sType.includes(q)
        );
      });
    }

    // 3. Sort Projects
    result.sort((a, b) => {
      if (sortBy === "dueDate") {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return dateA - dateB;
      }
      if (sortBy === "newest") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === "title") {
        return (a.projectName || "").localeCompare(b.projectName || "");
      }
      return 0;
    });

    return result;
  }, [projects, activeFilter, searchTerm, sortBy]);

  const vendorDisplayName =
    vendorProfile?.companyName ||
    vendorProfile?.userId?.name ||
    user?.name ||
    "Vendor Partner";

  const filterTabs = [
    { id: "All", label: "All", color: "bg-slate-800 text-white" },
    { id: "New", label: "New", color: "bg-[#3498DB] text-white" },
    { id: "In Progress", label: "In Progress", color: "bg-[#E67E22] text-white" },
    { id: "Submitted", label: "Submitted", color: "bg-[#9B59B6] text-white" },
    { id: "Completed", label: "Completed", color: "bg-[#2ECC71] text-white" },
    { id: "Overdue", label: "Overdue", color: "bg-[#E74C3C] text-white" },
  ];

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      {/* Shared Vendor Sidebar */}
      <VendorSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Layout Area */}
      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Shared Vendor Header */}
        <VendorHeader
          title="Projects"
          vendorName={vendorDisplayName}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Error Banner */}
          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={loadVendorProjects}
                className="flex items-center gap-1.5 bg-[#C62828] text-white px-3 py-1.5 rounded-xl font-bold hover:bg-[#B71C1C] transition-colors cursor-pointer"
              >
                <FiRefreshCw className="text-xs" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Search Bar & Sort Dropdown Row */}
          <div className="bg-white rounded-2xl border border-[#E8E2DE] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#817B77]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by address, city, work type, or project ID..."
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
              />
            </div>

            {/* Sort Control */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs font-semibold text-[#817B77]">
              <FiSliders className="text-xs" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3 py-2 text-xs font-bold text-[#3E3734] outline-none focus:border-[#C8B5AC] cursor-pointer"
              >
                <option value="dueDate">Due Date</option>
                <option value="newest">Newest First</option>
                <option value="title">Project Name</option>
              </select>
            </div>
          </div>

          {/* Status Filter Bar (Pill Tabs) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filterTabs.map((tab) => {
              const count = filterCounts[tab.id] || 0;
              const isActive = activeFilter === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                    isActive
                      ? "bg-[#3E3734] text-white ring-2 ring-[#3E3734]/20"
                      : "bg-white text-[#817B77] border border-[#E8E2DE] hover:bg-[#FAF7F5] hover:text-[#3E3734]"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      tab.id === "All"
                        ? "bg-[#3E3734]"
                        : tab.id === "New"
                        ? "bg-[#3498DB]"
                        : tab.id === "In Progress"
                        ? "bg-[#E67E22]"
                        : tab.id === "Submitted"
                        ? "bg-[#9B59B6]"
                        : tab.id === "Completed"
                        ? "bg-[#2ECC71]"
                        : "bg-[#E74C3C]"
                    }`}
                  />
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-[#FAF7F5] text-[#817B77]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Project Grid / Loading / Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-[#E8E2DE] h-72 animate-pulse p-4 flex flex-col justify-between"
                >
                  <div className="w-full h-36 bg-[#FAF7F5] rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-[#FAF7F5] rounded w-3/4" />
                    <div className="h-3 bg-[#FAF7F5] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : processedProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E2DE] p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F5] text-[#817B77] flex items-center justify-center mx-auto mb-3">
                <FiBriefcase size={24} />
              </div>
              <h3 className="text-sm font-bold text-[#3E3734] mb-1">
                {projects.length === 0
                  ? "No Projects Assigned"
                  : "No Matching Projects"}
              </h3>
              <p className="text-xs text-[#817B77] max-w-sm mx-auto">
                {projects.length === 0
                  ? "There are currently no field operation projects assigned to your vendor account."
                  : "No projects match your selected filter or search criteria."}
              </p>
              {activeFilter !== "All" || searchTerm ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("All");
                    setSearchTerm("");
                  }}
                  className="mt-4 px-4 py-2 bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl text-xs font-bold text-[#3E3734] hover:bg-[#EAE4DF] transition-colors"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {processedProjects.map((project) => (
                <VendorProjectCard
                  key={project._id || project.id}
                  project={project}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Projects;
