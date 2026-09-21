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
  FiCamera,
  FiPaperclip,
  FiFileText,
  FiDownload,
  FiMaximize2,
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

  // Lightbox Preview State
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

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

  const handlePreviewImage = (url, title = "Photo Preview") => {
    setPreviewImage(url);
    setPreviewTitle(title);
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

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
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
                  <span>MEDIA</span>
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

                const hasPhotos = project.photos && project.photos.length > 0;
                const hasAttachments = project.attachments && project.attachments.length > 0;

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

                    {/* Media Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {hasPhotos && (
                          <div className="flex items-center -space-x-1 hover:space-x-0.5 transition-all">
                            {project.photos.slice(0, 2).map((photo, pIdx) => (
                              <img
                                key={pIdx}
                                src={photo.url}
                                alt={photo.caption || "Photo"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviewImage(
                                    photo.url,
                                    photo.caption || `Photo ${pIdx + 1}`
                                  );
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                }}
                                className="w-7 h-7 rounded-lg object-cover border border-white shadow-xs cursor-pointer hover:scale-110 transition-transform bg-[#FAF7F5]"
                                title={photo.caption || "Click to view photo"}
                              />
                            ))}
                            {project.photos.length > 2 && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenViewModal(project);
                                }}
                                className="w-6 h-6 rounded-lg bg-[#FAF7F5] border border-[#E8E2DE] text-[10px] font-bold text-[#817B77] flex items-center justify-center cursor-pointer hover:bg-[#F2EBE5]"
                                title={`View all ${project.photos.length} photos`}
                              >
                                +{project.photos.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {hasAttachments && (
                          <a
                            href={project.attachments[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title={`Open ${project.attachments[0].filename || "attachment"}`}
                            className="inline-flex items-center gap-1 bg-[#FAF7F5] border border-[#E8E2DE] hover:bg-[#F2EBE5] px-2 py-1 rounded-lg text-[10px] font-semibold text-[#4A423F] transition-colors"
                          >
                            <FiPaperclip className="text-xs text-[#817B77]" />
                            <span>{project.attachments.length}</span>
                          </a>
                        )}

                        {!hasPhotos && !hasAttachments && (
                          <span className="text-[#A39A94] text-xs">—</span>
                        )}
                      </div>
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
                <td colSpan="8" className="py-8 text-center text-xs text-[#817B77]">
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

            {/* Photos Media Section */}
            {selectedProject.photos && selectedProject.photos.length > 0 && (
              <div className="pt-3 border-t border-[#F2EBE5]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#3E3734] flex items-center gap-1.5">
                    <FiCamera className="text-sm text-[#817B77]" />
                    <span>Project Photos ({selectedProject.photos.length})</span>
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {selectedProject.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        handlePreviewImage(
                          photo.url,
                          photo.caption || `Photo ${idx + 1}`
                        )
                      }
                      className="group relative bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl overflow-hidden cursor-pointer hover:border-[#C8B5AC] transition-all shadow-xs"
                    >
                      <div className="aspect-video w-full bg-[#EAE4DF] overflow-hidden flex items-center justify-center relative">
                        <img
                          src={photo.url}
                          alt={photo.caption || `Photo ${idx + 1}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23817B77' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2 flex items-center justify-between bg-white border-t border-[#F2EBE5]">
                        <span className="text-[11px] font-semibold text-[#3E3734] truncate max-w-[110px]">
                          {photo.caption || `Photo ${idx + 1}`}
                        </span>
                        <FiMaximize2 className="text-xs text-[#817B77] group-hover:text-[#3E3734] shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments Media Section */}
            {selectedProject.attachments && selectedProject.attachments.length > 0 && (
              <div className="pt-3 border-t border-[#F2EBE5]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#3E3734] flex items-center gap-1.5">
                    <FiPaperclip className="text-sm text-[#817B77]" />
                    <span>Project Attachments ({selectedProject.attachments.length})</span>
                  </h4>
                </div>
                <div className="space-y-2">
                  {selectedProject.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-2.5 flex items-center justify-between gap-3 hover:bg-[#F2EBE5] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E2DE] flex items-center justify-center shrink-0">
                          <FiFileText className="text-sm text-[#817B77]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#3E3734] truncate">
                            {att.filename || `Attachment ${idx + 1}`}
                          </p>
                          {att.size && (
                            <p className="text-[10px] text-[#817B77]">
                              {formatFileSize(att.size)}
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-white hover:bg-[#EAE4DF] border border-[#E8E2DE] text-[#3E3734] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-xs"
                      >
                        <FiDownload className="text-xs" />
                        <span>Open</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedProject.checklistItems?.length > 0 && (
              <div className="pt-3 border-t border-[#F2EBE5]">
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

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 bg-[#FAF8F6] border-b border-[#E8E2DE] flex items-center justify-between">
              <span className="text-xs font-bold text-[#3E3734] truncate max-w-md">
                {previewTitle}
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg"
              >
                <FiX className="text-base" />
              </button>
            </div>
            <div className="p-3 bg-[#221F1E] flex items-center justify-center overflow-hidden max-h-[80vh]">
              <img
                src={previewImage}
                alt={previewTitle}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-md"
              />
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

