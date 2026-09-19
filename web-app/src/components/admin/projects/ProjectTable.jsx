import { useState } from "react";
import ProjectStatusBadge from "./ProjectStatusBadge";
import {
  FiEye,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

const ALLOWED_STATUSES = [
  "New",
  "In Progress",
  "Submitted",
  "Under Review",
  "Approved",
  "Rejected",
];

const ProjectTable = ({
  projects = [],
  totalCount = 0,
  onUpdateStatus,
  isReadOnly = false,
}) => {
  // Modal State
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [statusModalProject, setStatusModalProject] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusError, setStatusError] = useState("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const handleOpenViewModal = (project) => {
    setSelectedProject(project);
    setViewModalOpen(true);
  };

  const handleOpenStatusModal = (project) => {
    setStatusModalProject(project);
    setNewStatus(project.status || "New");
    setRejectionReason(project.rejectionReason || "");
    setStatusError("");
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setStatusError("");

    if (newStatus === "Rejected" && !rejectionReason.trim()) {
      setStatusError("Rejection reason is required when rejecting a project.");
      return;
    }

    try {
      setIsSubmittingStatus(true);
      await onUpdateStatus(
        statusModalProject._id,
        newStatus,
        newStatus === "Rejected" ? rejectionReason.trim() : undefined
      );
      setStatusModalProject(null);
    } catch (err) {
      setStatusError(
        err.response?.data?.message || err.message || "Failed to update status."
      );
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col justify-between">
      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F2EBE5] text-[10px] font-bold tracking-wider text-[#A39A94] uppercase bg-[#FAF8F6]">
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>PROJECT ID</span>
                  <span className="text-[8px] text-[#A39A94]">▼</span>
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>PROPERTY ADDRESS / LOCATION</span>
                  <span className="text-[8px] text-[#A39A94]">⇅</span>
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>SERVICE TYPE</span>
                  <span className="text-[8px] text-[#A39A94]">⇅</span>
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>VENDOR</span>
                  <span className="text-[8px] text-[#A39A94]">⇅</span>
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>DUE DATE</span>
                  <span className="text-[8px] text-[#A39A94]">⇅</span>
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>STATUS</span>
                  <span className="text-[8px] text-[#A39A94]">⇅</span>
                </div>
              </th>
              <th className="py-3 px-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F4F2] text-xs">
            {projects.length > 0 ? (
              projects.map((project) => {
                const pId = project.projectId || project.id || project._id;
                const loc = project.location || project.address || "—";
                const sTypeName =
                  project.serviceTypeName ||
                  project.serviceId?.serviceTypeName ||
                  project.service ||
                  "—";
                const vName =
                  project.vendorName ||
                  project.vendorId?.companyName ||
                  project.vendor ||
                  "—";

                return (
                  <tr
                    key={project._id || pId}
                    className="hover:bg-[#FAF7F5] transition-colors"
                  >
                    {/* Project ID */}
                    <td className="py-3.5 px-4 font-semibold text-[#3E3734]">
                      {pId}
                    </td>

                    {/* Property Address */}
                    <td className="py-3.5 px-4 font-medium text-[#4A423F] max-w-[200px] truncate">
                      {loc}
                    </td>

                    {/* Service Type */}
                    <td className="py-3.5 px-4 text-[#6E6763]">
                      {sTypeName}
                    </td>

                    {/* Vendor */}
                    <td className="py-3.5 px-4 font-semibold text-[#3E3734]">
                      {vName}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 text-[#817B77]">
                      {formatDate(project.deadline || project.dueDate)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <ProjectStatusBadge status={project.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="View Details"
                          onClick={() => handleOpenViewModal(project)}
                          className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-md hover:bg-[#EAE4DF] transition-colors"
                        >
                          <FiEye className="text-sm" />
                        </button>
                        {!isReadOnly && (
                          <button
                            title="Update Status"
                            onClick={() => handleOpenStatusModal(project)}
                            className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-md hover:bg-[#EAE4DF] transition-colors"
                          >
                            <FiEdit2 className="text-sm" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center text-xs text-[#817B77]">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="px-6 py-4 border-t border-[#F2EBE5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#817B77] bg-[#FAF8F6]">
        <div>
          Showing {projects.length > 0 ? 1 : 0}–{projects.length} of {totalCount || projects.length} projects
        </div>

        <div className="flex items-center gap-1">
          <button
            aria-label="Previous Page"
            className="p-1.5 text-[#A39A94] hover:text-[#3E3734] rounded-lg transition-colors"
          >
            <FiChevronLeft className="text-sm" />
          </button>
          <button className="w-7 h-7 rounded-lg bg-[#C8B5AC] text-[#3E3734] font-bold text-xs flex items-center justify-center">
            1
          </button>
          <button
            aria-label="Next Page"
            className="p-1.5 text-[#817B77] hover:text-[#3E3734] rounded-lg transition-colors"
          >
            <FiChevronRight className="text-sm" />
          </button>
        </div>
      </div>

      {/* View Project Details Modal */}
      {viewModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#E8E2DE] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#3E3734]">
                  {selectedProject.projectName || selectedProject.projectId}
                </h3>
                <p className="text-xs text-[#817B77]">
                  {selectedProject.projectId} — {selectedProject.client}
                </p>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold text-[#817B77]">Service Type:</span>{" "}
                <span className="text-[#3E3734] font-medium">
                  {selectedProject.serviceTypeName || selectedProject.serviceId?.serviceTypeName || "—"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#817B77]">Vendor:</span>{" "}
                <span className="text-[#3E3734] font-medium">
                  {selectedProject.vendorName || selectedProject.vendorId?.companyName || "Unassigned"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#817B77]">Location:</span>{" "}
                <span className="text-[#3E3734] font-medium">
                  {selectedProject.location || "—"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#817B77]">Deadline:</span>{" "}
                <span className="text-[#3E3734] font-medium">
                  {formatDate(selectedProject.deadline)}
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-2 pt-1">
                <span className="font-semibold text-[#817B77]">Status:</span>
                <ProjectStatusBadge status={selectedProject.status} />
              </div>
            </div>

            {selectedProject.status === "Rejected" && selectedProject.rejectionReason && (
              <div className="bg-[#FFEBEE] border border-[#C62828]/20 rounded-xl p-3 text-xs text-[#C62828]">
                <span className="font-bold">Rejection Reason:</span>{" "}
                {selectedProject.rejectionReason}
              </div>
            )}

            {selectedProject.description && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-[#3E3734] mb-1">Description</h4>
                <p className="text-xs text-[#6E6763] bg-[#FAF7F5] p-3 rounded-xl border border-[#E8E2DE]">
                  {selectedProject.description}
                </p>
              </div>
            )}

            {selectedProject.checklistItems?.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-[#3E3734] mb-1.5">Checklist</h4>
                <div className="space-y-1">
                  {selectedProject.checklistItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-[#3E3734]"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        readOnly
                        className="rounded text-[#8A817C]"
                      />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#F2EBE5] flex justify-end">
              <button
                onClick={() => setViewModalOpen(false)}
                className="bg-[#F2EBE5] text-[#3E3734] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#EAE4DF] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Project Status Modal */}
      {statusModalProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStatus}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E8E2DE] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
              <h3 className="text-sm font-bold text-[#3E3734]">
                Update Project Status
              </h3>
              <button
                type="button"
                onClick={() => setStatusModalProject(null)}
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <p className="text-xs text-[#817B77]">
              Project ID: <span className="font-semibold text-[#3E3734]">{statusModalProject.projectId}</span>
            </p>

            {statusError && (
              <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{statusError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1">
                Select Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC]"
              >
                {ALLOWED_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {newStatus === "Rejected" && (
              <div>
                <label className="block text-xs font-bold text-[#3E3734] mb-1">
                  Rejection Reason <span className="text-[#C62828]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide explicit reason for rejection..."
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC]"
                />
              </div>
            )}

            <div className="pt-3 border-t border-[#F2EBE5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStatusModalProject(null)}
                disabled={isSubmittingStatus}
                className="bg-white border border-[#E8E2DE] text-[#6E6763] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#F2EBE5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingStatus}
                className="bg-[#8A817C] text-white font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#6E6763] transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <FiCheckCircle className="text-xs" />
                <span>{isSubmittingStatus ? "Updating..." : "Update Status"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProjectTable;
