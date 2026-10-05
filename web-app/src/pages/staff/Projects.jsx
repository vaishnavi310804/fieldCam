import { useState, useEffect } from "react";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import { getStaffProjects } from "../../services/projectService";
import { useAuth } from "../../context/AuthContext";
import {
  FiBriefcase,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiMapPin,
  FiCalendar,
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
        err.response?.data?.message || err.message || "Failed to load staff projects"
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
      (p.location || "").toLowerCase().includes(searchTerm.toLowerCase())
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

          {loading && (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-12 text-center text-xs text-[#817B77] space-y-2">
              <FiLoader className="animate-spin text-2xl mx-auto text-[#8A817C]" />
              <p className="font-semibold">Loading assigned projects...</p>
            </div>
          )}

          {!loading && (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
                <div>
                  <h2 className="text-sm font-bold text-[#3E3734]">Your Projects</h2>
                  <p className="text-xs text-[#817B77] mt-0.5">
                    Field assignments allocated to your staff account
                  </p>
                </div>
              </div>

              {filteredProjects.length > 0 ? (
                <div className="space-y-3">
                  {filteredProjects.map((proj) => (
                    <div
                      key={proj._id || proj.projectId}
                      className="bg-[#FAF7F5] border border-[#E8E2DE] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#817B77] bg-white border border-[#E8E2DE] px-2 py-0.5 rounded">
                            {proj.projectId || "Project"}
                          </span>
                          <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded">
                            {proj.status || "Assigned"}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-[#3E3734]">
                          {proj.projectName}
                        </h3>
                        <div className="flex items-center gap-3 text-[11px] text-[#817B77]">
                          <span className="flex items-center gap-1">
                            <FiMapPin className="text-xs" />
                            <span>{proj.location || "N/A"}</span>
                          </span>
                          {proj.deadline && (
                            <span className="flex items-center gap-1">
                              <FiCalendar className="text-xs" />
                              <span>{new Date(proj.deadline).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#FAF7F5] border border-dashed border-[#E8E2DE] rounded-xl p-12 text-center text-xs text-[#817B77] space-y-2">
                  <FiBriefcase className="text-3xl mx-auto text-[#A39A94]" />
                  <p className="font-bold text-[#3E3734] text-sm">No Projects Assigned Yet</p>
                  <p className="max-w-md mx-auto">
                    When your vendor partner assigns field projects to your staff account, they will appear here automatically.
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
