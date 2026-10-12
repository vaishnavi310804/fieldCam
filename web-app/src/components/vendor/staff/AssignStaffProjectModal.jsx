import { useState, useMemo, useEffect } from "react";
import {
  FiX,
  FiSearch,
  FiSliders,
  FiAlertCircle,
  FiBriefcase,
} from "react-icons/fi";
import ProjectSelectionCard from "./ProjectSelectionCard";
import {
  assignStaffToProject,
  getProjects,
} from "../../../services/projectService";

const AssignStaffProjectModalDialog = ({
  onClose,
  staff,
  initialProjects = [],
  onAssignSuccess,
}) => {
  const [projectList, setProjectList] = useState(initialProjects);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("All");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const staffName = staff.name || "Staff Member";
  const roleTitle = staff.title || staff.department || "Field Staff";
  const activeAssignedCount = staff.activeProjects !== undefined ? staff.activeProjects : 0;

  const staffInitials = staffName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || "ST";

  useEffect(() => {
    let isMounted = true;
    const fetchLatestProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await getProjects();
        const data = Array.isArray(res) ? res : res?.data || [];
        if (isMounted) {
          setProjectList(data);
        }
      } catch (err) {
        console.warn("Could not refresh projects in assign modal:", err);
      } finally {
        if (isMounted) setLoadingProjects(false);
      }
    };

    fetchLatestProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  const eligibleProjects = useMemo(() => {
    return projectList.filter((p) => {
      const s = (p.status || "").toUpperCase();
      return (
        s !== "APPROVED" &&
        s !== "COMPLETED" &&
        s !== "REJECTED"
      );
    });
  }, [projectList]);

  const selectableProjects = useMemo(() => {
    return eligibleProjects.filter((p) => {
      const s = (p.status || "").toUpperCase();
      return s === "ASSIGNED" && !p.assignedStaffId;
    });
  }, [eligibleProjects]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set();
    eligibleProjects.forEach((p) => {
      if (p.status) statuses.add(p.status);
    });
    return Array.from(statuses);
  }, [eligibleProjects]);

  const availableServiceTypes = useMemo(() => {
    const types = new Set();
    eligibleProjects.forEach((p) => {
      if (p.serviceTypeName) types.add(p.serviceTypeName);
    });
    return Array.from(types);
  }, [eligibleProjects]);

  const filteredProjects = useMemo(() => {
    return eligibleProjects.filter((p) => {
      if (statusFilter !== "All" && p.status !== statusFilter) {
        return false;
      }

      if (
        serviceTypeFilter !== "All" &&
        p.serviceTypeName !== serviceTypeFilter
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const name = (p.projectName || "").toLowerCase();
        const code = (p.projectId || "").toLowerCase();
        const service = (p.serviceTypeName || "").toLowerCase();
        const loc = (p.location || "").toLowerCase();

        return (
          name.includes(query) ||
          code.includes(query) ||
          service.includes(query) ||
          loc.includes(query)
        );
      }

      return true;
    });
  }, [eligibleProjects, statusFilter, serviceTypeFilter, searchQuery]);

  const handleToggleProject = (projectId) => {
    const target = projectList.find((p) => (p._id || p.id) === projectId);
    if (!target) return;
    const s = (target.status || "").toUpperCase();
    if (s !== "ASSIGNED" || target.assignedStaffId) {
      return;
    }
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAllVisible = () => {
    const assignableInView = filteredProjects
      .filter((p) => {
        const s = (p.status || "").toUpperCase();
        return s === "ASSIGNED" && !p.assignedStaffId;
      })
      .map((p) => p._id || p.id);

    setSelectedProjectIds((prev) => {
      const merged = new Set([...prev, ...assignableInView]);
      return Array.from(merged);
    });
  };

  const handleClearSelections = () => {
    setSelectedProjectIds([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (selectedProjectIds.length === 0) {
      setError("Please select at least one project to assign.");
      return;
    }

    if (!staff?._id) {
      setError("Selected staff member is missing an ID.");
      return;
    }

    try {
      setIsSubmitting(true);

      const results = await Promise.allSettled(
        selectedProjectIds.map((projectId) =>
          assignStaffToProject(projectId, staff._id)
        )
      );

      const successfulIds = [];
      const failedItems = [];

      results.forEach((res, index) => {
        const projId = selectedProjectIds[index];
        if (res.status === "fulfilled") {
          successfulIds.push(projId);
        } else {
          const message =
            res.reason?.response?.data?.message ||
            res.reason?.message ||
            "Assignment failed";
          failedItems.push({ projectId: projId, error: message });
        }
      });

      if (failedItems.length === 0) {
        if (onAssignSuccess) {
          await onAssignSuccess(successfulIds.length);
        }
        onClose();
      } else if (successfulIds.length > 0) {
        setSelectedProjectIds(failedItems.map((f) => f.projectId));
        setError(
          `Assigned ${successfulIds.length} project(s). ${failedItems.length} failed: ${failedItems[0].error}`
        );
        if (onAssignSuccess) {
          await onAssignSuccess(successfulIds.length);
        }
      } else {
        setError(
          failedItems[0]?.error ||
            "Failed to assign the selected projects. Please try again."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred during assignment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#C9A69B] p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {staff.profileImage ? (
              <img
                src={staff.profileImage}
                alt={staffName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/60 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full border-2 border-[#3E3734]/30 bg-[#E8DDD8] flex items-center justify-center text-[#3E3734] font-bold text-sm shadow-xs shrink-0">
                {staffInitials}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-[#221F1E] truncate leading-tight">
                Assign Projects to {staffName}
              </h2>
              <p className="text-xs text-[#524B47] mt-0.5 font-medium truncate">
                {roleTitle} • Currently assigned to {activeAssignedCount} project
                {activeAssignedCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-white/40 hover:bg-white/70 flex items-center justify-center text-[#3E3734] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            aria-label="Close dialog"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Search & Filters Bar */}
        <div className="px-5 pt-4 pb-3 border-b border-[#F0ECE9] space-y-3 bg-white shrink-0">
          <div className="relative">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77]"
              size={15}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name, code, type, or location..."
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-[#3E3734] outline-none focus:border-[#C87A65] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#817B77] hover:text-[#3E3734] cursor-pointer"
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#817B77]">
                <FiSliders size={13} />
                <span>Filters:</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-lg px-2.5 py-1 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C87A65] transition-colors cursor-pointer"
              >
                <option value="All">All Statuses</option>
                {availableStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              <select
                value={serviceTypeFilter}
                onChange={(e) => setServiceTypeFilter(e.target.value)}
                className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-lg px-2.5 py-1 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C87A65] transition-colors cursor-pointer"
              >
                <option value="All">All Types</option>
                {availableServiceTypes.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#3E3734]">
                {selectedProjectIds.length} of {selectableProjects.length} selected
              </span>
              {selectedProjectIds.length > 0 ? (
                <button
                  type="button"
                  onClick={handleClearSelections}
                  className="text-[11px] text-[#C87A65] hover:underline cursor-pointer font-semibold ml-1"
                >
                  Clear
                </button>
              ) : filteredProjects.length > 0 ? (
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="text-[11px] text-[#817B77] hover:text-[#3E3734] hover:underline cursor-pointer font-semibold ml-1"
                >
                  Select All
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-5 mt-3 bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0">
            <FiAlertCircle className="shrink-0 text-sm" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Project Cards List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[220px]">
          {loadingProjects && projectList.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-[#E8E2DE] p-4 h-28 animate-pulse flex flex-col justify-between"
                >
                  <div className="h-4 bg-[#FAF7F5] rounded w-1/3" />
                  <div className="h-3 bg-[#FAF7F5] rounded w-1/4" />
                  <div className="h-3 bg-[#FAF7F5] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : eligibleProjects.length === 0 ? (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-8 text-center text-[#817B77] space-y-2">
              <FiBriefcase className="mx-auto text-2xl text-[#A39A94]" />
              <p className="text-sm font-bold text-[#3E3734]">
                No Assignable Projects Available
              </p>
              <p className="text-xs max-w-sm mx-auto">
                There are currently no active or assignable projects for your
                vendor organization. All completed or approved projects are
                closed.
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-8 text-center text-[#817B77] space-y-2">
              <FiBriefcase className="mx-auto text-2xl text-[#A39A94]" />
              <p className="text-sm font-bold text-[#3E3734]">
                No Matching Projects Found
              </p>
              <p className="text-xs">
                Try adjusting your search query or filter options.
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const projId = project._id || project.id;
              const isSelected = selectedProjectIds.includes(projId);
              const assignedStaffIdStr = (
                project.assignedStaffId?._id || project.assignedStaffId
              )?.toString();
              const isAlreadyAssigned =
                assignedStaffIdStr &&
                assignedStaffIdStr === staff._id?.toString();

              return (
                <ProjectSelectionCard
                  key={projId}
                  project={project}
                  isSelected={isSelected}
                  isAlreadyAssigned={Boolean(isAlreadyAssigned)}
                  staffName={staffName}
                  onToggle={handleToggleProject}
                />
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#F0ECE9] bg-white flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#E8E2DE] bg-[#F7D8CF] text-xs sm:text-sm font-bold text-[#3E3734] hover:bg-[#FAF7F5] transition-colors cursor-pointer text-center disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedProjectIds.length === 0}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#928880] hover:bg-[#B36854] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Assigning...</span>
              </>
            ) : (
              <span>
                {selectedProjectIds.length === 0
                  ? "Assign Projects"
                  : `Assign ${selectedProjectIds.length} Project${
                      selectedProjectIds.length === 1 ? "" : "s"
                    }`}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignStaffProjectModal = ({
  isOpen,
  onClose,
  staff,
  projects = [],
  onAssignSuccess,
}) => {
  if (!isOpen || !staff) return null;

  return (
    <AssignStaffProjectModalDialog
      key={staff._id || "assign-modal"}
      onClose={onClose}
      staff={staff}
      initialProjects={projects}
      onAssignSuccess={onAssignSuccess}
    />
  );
};

export default AssignStaffProjectModal;
