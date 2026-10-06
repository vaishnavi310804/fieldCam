import { useState, useEffect } from "react";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import StaffProjectCard from "../../components/staff/StaffProjectCard";
import { getStaffProjects } from "../../services/projectService";
import { useAuth } from "../../context/AuthContext";
import {
  FiBriefcase,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

const StaffProjects = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaffProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStaffProjects();
      const projData = Array.isArray(res) ? res : res?.data || [];
      setProjects(projData);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to load your projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffProjects();
  }, []);

  const filteredProjects = projects.filter(
    (p) =>
      !searchTerm.trim() ||
      (p.projectName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.projectId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      <StaffSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        <StaffHeader
          title="Assigned Projects"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Error Banner */}
          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchStaffProjects}
                className="flex items-center gap-1.5 bg-[#C62828] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#B71C1C] transition-colors cursor-pointer"
              >
                <FiRefreshCw className="text-xs" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-12 text-center text-xs text-[#817B77] space-y-2 shadow-xs">
              <FiLoader className="animate-spin text-2xl mx-auto text-[#8A817C]" />
              <p className="font-semibold">Loading assigned projects...</p>
            </div>
          )}

          {/* Projects Content Grid */}
          {!loading && !error && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#3E3734]">
                    Your Projects ({filteredProjects.length})
                  </h2>
                  <p className="text-xs text-[#817B77] mt-0.5">
                    Field assignments allocated to your staff account
                  </p>
                </div>
              </div>

              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((proj) => (
                    <StaffProjectCard
                      key={proj._id || proj.projectId}
                      project={proj}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#E8E2DE] rounded-2xl p-12 text-center text-xs text-[#817B77] space-y-2 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center mx-auto text-[#A39A94]">
                    <FiBriefcase className="text-2xl" />
                  </div>
                  <p className="font-bold text-[#3E3734] text-sm pt-2">
                    No assigned projects yet
                  </p>
                  <p className="max-w-md mx-auto text-[#817B77]">
                    When your vendor partner assigns field projects to your staff account, they will appear here automatically as project cards.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StaffProjects;
