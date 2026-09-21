import { useState, useEffect } from "react";
import { getProjects, updateProject } from "../../../services/projectService";
import {
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronDown,
  FiFolder,
  FiMapPin,
  FiTag,
  FiBriefcase,
} from "react-icons/fi";

const AssignProjectModal = ({ isOpen, onClose, vendor, onAssignSuccess }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !vendor) return;

    const fetchProjectsData = async () => {
      setSelectedProjectId("");
      setError("");
      setLoadingProjects(true);

      try {
        const res = await getProjects();
        const projectList = Array.isArray(res) ? res : res.data || [];
        setProjects(projectList);

        // Auto-select first unassigned project, or first project overall
        const unassigned = projectList.find(
          (p) => !p.vendorId || (typeof p.vendorId === "object" && !p.vendorId._id)
        );
        if (unassigned) {
          setSelectedProjectId(unassigned._id);
        } else if (projectList.length > 0) {
          setSelectedProjectId(projectList[0]._id);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load available projects"
        );
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjectsData();
  }, [isOpen, vendor]);

  if (!isOpen || !vendor) return null;

  const vendorName = vendor.companyName || vendor.company || "Selected Vendor";
  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!vendor?._id) {
      setError("Invalid vendor profile selected.");
      return;
    }

    if (!selectedProjectId) {
      setError("Please select a project to assign.");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateProject(selectedProjectId, {
        vendorId: vendor._id,
      });

      if (onAssignSuccess) {
        await onAssignSuccess();
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to assign project to vendor."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-[#EEE9E6] border border-[#E8E2DE] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#3E3734]">Assign Project</h2>
            <p className="text-xs text-[#817B77] mt-0.5">
              Assign an operational project to{" "}
              <span className="font-semibold text-[#3E3734]">{vendorName}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-[#817B77] hover:text-[#3E3734] p-1.5 rounded-xl hover:bg-[#EAE4DF] transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <FiAlertCircle className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5"
        >
          {loadingProjects ? (
            <div className="py-8 text-center text-xs text-[#817B77]">
              Loading available projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#817B77]">
              No projects found in system. Please create a project first.
            </div>
          ) : (
            <>
              {/* Project Select Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                  Select Project <span className="text-[#C62828]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors appearance-none cursor-pointer pr-10"
                  >
                    <option value="">-- Choose a project --</option>
                    {projects.map((p) => {
                      const isAssigned = Boolean(p.vendorId);
                      const currentVendor =
                        p.vendorName || p.vendorId?.companyName || "Assigned";

                      return (
                        <option key={p._id} value={p._id}>
                          {p.projectName} ({p.projectId || "Project"})
                          {isAssigned ? ` • [Currently: ${currentVendor}]` : " • [Unassigned]"}
                        </option>
                      );
                    })}
                  </select>
                  <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
                </div>
              </div>

              {/* Selected Project Summary Card */}
              {selectedProject && (
                <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[#3E3734] flex items-center gap-1.5">
                    <FiFolder className="text-[#8A817C]" />
                    <span>Project Overview</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        Project Code
                      </span>
                      <span className="font-semibold text-[#3E3734]">
                        {selectedProject.projectId || "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        Service Type
                      </span>
                      <span className="font-semibold text-[#3E3734] flex items-center gap-1 mt-0.5">
                        <FiTag className="text-[10px] text-[#817B77]" />
                        {selectedProject.serviceTypeName || "General Service"}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        Location
                      </span>
                      <span className="font-semibold text-[#3E3734] flex items-center gap-1 mt-0.5">
                        <FiMapPin className="text-[10px] text-[#817B77]" />
                        {selectedProject.location || "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        Current Vendor
                      </span>
                      <span className="font-semibold text-[#3E3734] flex items-center gap-1 mt-0.5">
                        <FiBriefcase className="text-[10px] text-[#817B77]" />
                        {selectedProject.vendorName ||
                          selectedProject.vendorId?.companyName ||
                          "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Bottom Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F2EBE5]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-white hover:bg-[#F2EBE5] text-[#6E6763] hover:text-[#3E3734] border border-[#E8E2DE] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <FiX className="text-xs" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || loadingProjects || !selectedProjectId}
              className="bg-[#8A817C] hover:bg-[#6E6763] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <FiCheckCircle className="text-xs" />
              <span>{isSubmitting ? "Assigning..." : "Assign Project"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignProjectModal;
