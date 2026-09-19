import { useState, useEffect, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import ProjectToolbar from "../../components/admin/projects/ProjectToolbar";
import ProjectFilters from "../../components/admin/projects/ProjectFilters";
import ProjectTable from "../../components/admin/projects/ProjectTable";
import { getProjects, updateProjectStatus } from "../../services/projectService";
import { useAuth } from "../../context/AuthContext";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

const Projects = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isReadOnly = user?.role === "VENDOR";

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProjects();
      setAllProjects(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load projects from server"
      );
      setAllProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleUpdateStatus = async (id, status, rejectionReason) => {
    await updateProjectStatus(id, status, rejectionReason);
    // Refresh projects list after status mutation
    await loadProjects();
  };

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      // Filter by status tab
      if (activeFilter !== "All" && project.status !== activeFilter) {
        return false;
      }

      // Filter by search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const pId = (project.projectId || project.id || "").toLowerCase();
        const pName = (project.projectName || "").toLowerCase();
        const loc = (project.location || project.address || "").toLowerCase();
        const vName = (
          project.vendorName ||
          project.vendorId?.companyName ||
          project.vendor ||
          ""
        ).toLowerCase();
        const sTypeName = (
          project.serviceTypeName ||
          project.serviceId?.serviceTypeName ||
          project.service ||
          ""
        ).toLowerCase();
        const client = (project.client || "").toLowerCase();

        return (
          pId.includes(query) ||
          pName.includes(query) ||
          loc.includes(query) ||
          vName.includes(query) ||
          sTypeName.includes(query) ||
          client.includes(query)
        );
      }

      return true;
    });
  }, [allProjects, searchTerm, activeFilter]);

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      {/* Fixed Sidebar */}
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container Area */}
      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Projects Page Header */}
        <AdminHeader
          title="Projects"
          subtitle="Manage and track all field operation projects."
          showSearch={true}
        />

        {/* Projects Page Body */}
        <main className="flex-1 p-6 space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadProjects}
                className="flex items-center gap-1.5 bg-[#C62828] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#B71C1C] transition-colors"
              >
                <FiRefreshCw className="text-xs" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* 1. Project Toolbar (Search, Export, New Project) */}
          <ProjectToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isReadOnly={isReadOnly}
          />

          {/* 2. Project Filters (Status Pills, More Filters, Approval Requests) */}
          <ProjectFilters
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            allProjects={allProjects}
          />

          {/* 3. Project Table Card */}
          {loading ? (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-12 text-center text-xs text-[#817B77]">
              Loading projects from platform service...
            </div>
          ) : (
            <ProjectTable
              projects={filteredProjects}
              totalCount={allProjects.length}
              onUpdateStatus={handleUpdateStatus}
              isReadOnly={isReadOnly}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Projects;
