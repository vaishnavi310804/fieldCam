import { useState, useEffect } from "react";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import { getStaffProjects } from "../../services/projectService";
import { useAuth } from "../../context/AuthContext";
import {
  FiBriefcase,
  FiClock,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";

const StaffDashboard = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaffDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStaffProjects();
      const assigned = Array.isArray(res) ? res : res?.data || [];
      setAssignedProjects(assigned);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load staff dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffDashboardData();
  }, []);

  // Filter assigned projects by search term
  const filteredProjects = assignedProjects.filter(
    (p) =>
      !searchTerm.trim() ||
      (p.projectName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.projectId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Derive counts from REAL assigned staff projects
  const assignedCount = assignedProjects.length;
  const inProgressCount = assignedProjects.filter(
    (p) => (p.status || "").toUpperCase() === "IN PROGRESS"
  ).length;
  const completedCount = assignedProjects.filter(
    (p) => (p.status || "").toUpperCase() === "APPROVED" || (p.status || "").toUpperCase() === "COMPLETED"
  ).length;

  const staffDisplayName = user?.name || user?.email?.split("@")[0] || "Staff Member";

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      {/* Sidebar */}
      <StaffSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Layout Area */}
      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Header */}
        <StaffHeader
          title="Staff Dashboard"
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
                onClick={fetchStaffDashboardData}
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
              <p className="font-semibold">Loading your real operational data from backend...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* 1. Staff Metric Overview Cards (3 Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Card 1: Assigned Projects */}
                <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] text-[#1976D2] flex items-center justify-center font-bold text-base shadow-xs">
                      <FiBriefcase />
                    </div>
                    <span className="text-[10px] font-bold text-[#817B77] bg-[#FAF7F5] px-2 py-0.5 rounded-full border border-[#F2EBE5]">
                      Assigned
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#3E3734]">{assignedCount}</h3>
                    <p className="text-xs font-semibold text-[#817B77] mt-0.5">Assigned Projects</p>
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

                {/* Card 3: Completed */}
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

              {/* 2. Assigned Projects Section */}
              <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-[#3E3734]">Assigned Projects</h2>
                    <p className="text-xs text-[#817B77] mt-0.5">
                      Your current field work assignments
                    </p>
                  </div>
                </div>

                {filteredProjects.length > 0 ? (
                  <div className="space-y-3">
                    {filteredProjects.map((proj) => (
                      <div
                        key={proj._id || proj.projectId}
                        className="bg-[#FAF7F5] border border-[#E8E2DE] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#817B77] bg-white border border-[#E8E2DE] px-2 py-0.5 rounded">
                              {proj.projectId || "PRJ"}
                            </span>
                            <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded">
                              {proj.status || "Assigned"}
                            </span>
                          </div>

                          <h3 className="text-xs font-bold text-[#3E3734] truncate">
                            {proj.projectName}
                          </h3>

                          <div className="flex items-center gap-3 text-[11px] text-[#817B77]">
                            <span className="flex items-center gap-1">
                              <FiMapPin className="text-xs shrink-0" />
                              <span className="truncate">{proj.location || "N/A"}</span>
                            </span>
                            {proj.deadline && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <FiCalendar className="text-xs shrink-0" />
                                  <span>{new Date(proj.deadline).toLocaleDateString()}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#FAF7F5] border border-dashed border-[#E8E2DE] rounded-xl p-10 text-center text-xs text-[#817B77] space-y-1">
                    <FiBriefcase className="text-3xl mx-auto text-[#A39A94]" />
                    <p className="font-bold text-[#3E3734]">No Assigned Projects Yet</p>
                    <p>Projects assigned to you by your vendor will appear here.</p>
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

export default StaffDashboard;
