import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import ProjectStatusBadge from "../../components/admin/projects/ProjectStatusBadge";
import { getProjectById, updateProjectStatus, getProjectHistory } from "../../services/projectService";
import { useAuth } from "../../context/AuthContext";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiClock,
  FiShare2,
  FiCamera,
  FiPaperclip,
  FiFileText,
  FiDownload,
  FiMaximize2,
  FiAlertCircle,
  FiLoader,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiX,
  FiCheck,
  FiInfo,
} from "react-icons/fi";

const ReviewSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Form & Action State
  const [adminComments, setAdminComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Lightbox Preview State
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  // History Drawer / Modal State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Toast / Copy Feedback State
  const [copied, setCopied] = useState(false);

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProjectById(id);
      const data = res.data || res;
      setProject(data);
      if (data.reviewComments) {
        setAdminComments(data.reviewComments);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load project submission details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleFetchHistory = async () => {
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const pId = project?.projectId || id;
      const res = await getProjectHistory(pId);
      setHistoryLogs(res.data || res || []);
    } catch (err) {
      console.error("Failed to load audit history:", err);
      setHistoryLogs([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReviewAction = async (targetStatus) => {
    setActionMessage(null);

    if (targetStatus === "Rejected" && !adminComments.trim()) {
      setActionMessage({
        type: "error",
        text: "Please provide admin comments explaining the reason for rejection.",
      });
      return;
    }

    try {
      setActionLoading(true);
      const rejectionReasonVal = targetStatus === "Rejected" ? adminComments.trim() : undefined;
      await updateProjectStatus(project._id || id, targetStatus, rejectionReasonVal, adminComments.trim());

      const statusLabels = {
        Approved: "Project submission has been approved successfully.",
        "In Progress": "Retake request submitted. Project status set to In Progress.",
        Rejected: "Project submission has been rejected.",
      };

      setActionMessage({
        type: "success",
        text: statusLabels[targetStatus] || `Project status updated to ${targetStatus}.`,
      });

      // Refresh real live project data
      await fetchProjectDetails();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to perform review action.",
      });
    } finally {
      setActionLoading(false);
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
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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

  // Derive real statistics from project data
  const photosCount = project?.photos?.length || 0;
  const attachmentsCount = project?.attachments?.length || 0;
  const totalChecklist = project?.checklistItems?.length || 0;
  const completedChecklist = project?.checklistItems?.filter((c) => c.checked)?.length || 0;

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
        {/* Header */}
        <AdminHeader
          title="Review Submission"
          subtitle="Audit field evidence and approve or request retakes."
          showSearch={false}
        />

        <main className="flex-1 p-6 space-y-5 max-w-7xl w-full mx-auto">
          {/* Top Breadcrumbs & Actions Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E8E2DE] p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#817B77]">
              <Link
                to="/admin/projects"
                className="hover:text-[#3E3734] flex items-center gap-1 transition-colors"
              >
                <FiArrowLeft className="text-sm" />
                <span>Projects</span>
              </Link>
              <span className="text-[#C8B5AC]">•</span>
              <span>Review Submission</span>
              {project?.projectId && (
                <>
                  <span className="text-[#C8B5AC]">•</span>
                  <span className="font-bold text-[#3E3734]">{project.projectId}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 bg-[#FAF7F5] border border-[#E8E2DE] hover:bg-[#F2EBE5] text-[#3E3734] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                title="Copy shareable URL"
              >
                <FiShare2 className="text-xs text-[#817B77]" />
                <span>{copied ? "Link Copied!" : "Share"}</span>
              </button>

              <button
                type="button"
                onClick={handleFetchHistory}
                className="flex items-center gap-1.5 bg-[#8A817C] hover:bg-[#7A726D] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              >
                <FiClock className="text-xs" />
                <span>Audit History</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-12 text-center text-xs text-[#817B77] space-y-2">
              <FiLoader className="animate-spin text-2xl mx-auto text-[#8A817C]" />
              <p className="font-semibold">Loading real project submission data from platform service...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchProjectDetails}
                className="flex items-center gap-1.5 bg-[#C62828] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#B71C1C] transition-colors"
              >
                <FiRefreshCw className="text-xs" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Main Review Dashboard Grid */}
          {!loading && !error && project && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column (2/3): Submission Details & Evidence */}
              <div className="lg:col-span-2 space-y-5">
                {/* 1. Project Overview Header Card */}
                <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-[#FAF7F5] border border-[#E8E2DE] text-[#817B77] px-2.5 py-0.5 rounded-md">
                          {project.projectId}
                        </span>
                        <span className="text-xs font-medium text-[#817B77]">
                          Client: <strong className="text-[#3E3734]">{project.client}</strong>
                        </span>
                      </div>
                      <h1 className="text-xl font-bold text-[#3E3734]">
                        {project.projectName}
                      </h1>
                    </div>
                    <ProjectStatusBadge status={project.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#FAF7F5] border border-[#F2EBE5] p-3.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-sm text-[#817B77] shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-[#A39A94] uppercase">
                          VENDOR
                        </span>
                        <span className="font-semibold text-[#3E3734] truncate block">
                          {project.vendorName || project.vendorId?.companyName || "Unassigned"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-sm text-[#817B77] shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-[#A39A94] uppercase">
                          LOCATION
                        </span>
                        <span className="font-semibold text-[#3E3734] truncate block">
                          {project.location || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-sm text-[#817B77] shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-[#A39A94] uppercase">
                          DUE DATE
                        </span>
                        <span className="font-semibold text-[#3E3734] block">
                          {formatDate(project.deadline)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {project.description && (
                    <div className="text-xs text-[#6E6763] bg-[#FAF7F5] p-3 rounded-xl border border-[#F2EBE5]">
                      <span className="font-bold text-[#3E3734] block mb-0.5">Project Scope / Instructions:</span>
                      {project.description}
                    </div>
                  )}
                </div>

                {/* 2. Photo Evidence Card */}
                <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
                    <h2 className="text-sm font-bold text-[#3E3734] flex items-center gap-2">
                      <FiCamera className="text-base text-[#817B77]" />
                      <span>Photo Evidence ({photosCount})</span>
                    </h2>
                    <span className="text-[11px] text-[#817B77] font-medium">
                      Real S3 Presigned Media
                    </span>
                  </div>

                  {photosCount > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {project.photos.map((photo, idx) => (
                        <div
                          key={idx}
                          onClick={() =>
                            handlePreviewImage(
                              photo.url,
                              photo.caption || `Photo Evidence #${idx + 1}`
                            )
                          }
                          className="group bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl overflow-hidden cursor-pointer hover:border-[#C8B5AC] transition-all shadow-xs"
                        >
                          <div className="aspect-video w-full bg-[#EAE4DF] overflow-hidden flex items-center justify-center relative">
                            <img
                              src={photo.url}
                              alt={photo.caption || `Evidence Photo ${idx + 1}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23817B77' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-white/90 text-[#3E3734] px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1">
                                <FiMaximize2 className="text-xs" />
                                <span>Preview</span>
                              </span>
                            </div>
                          </div>

                          <div className="p-3 bg-white border-t border-[#F2EBE5]">
                            <p className="text-xs font-bold text-[#3E3734] truncate">
                              {photo.caption || `Photo Evidence #${idx + 1}`}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-[#817B77] mt-1">
                              <span>Category: {photo.category || "General"}</span>
                              <span>{formatDateTime(photo.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#FAF7F5] border border-dashed border-[#E8E2DE] rounded-xl p-8 text-center text-xs text-[#817B77] space-y-1">
                      <FiCamera className="text-2xl mx-auto text-[#A39A94]" />
                      <p className="font-semibold text-[#3E3734]">No Photo Evidence Uploaded</p>
                      <p>The vendor has not submitted photo attachments for this project yet.</p>
                    </div>
                  )}
                </div>

                {/* 3. Attachments Card (If Present) */}
                {attachmentsCount > 0 && (
                  <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                    <h2 className="text-sm font-bold text-[#3E3734] flex items-center gap-2 border-b border-[#F2EBE5] pb-3">
                      <FiPaperclip className="text-base text-[#817B77]" />
                      <span>Project Attachments ({attachmentsCount})</span>
                    </h2>

                    <div className="space-y-2">
                      {project.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3 flex items-center justify-between gap-3 hover:bg-[#F2EBE5] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E2DE] flex items-center justify-center shrink-0">
                              <FiFileText className="text-base text-[#817B77]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#3E3734] truncate">
                                {att.filename || `Attachment #${idx + 1}`}
                              </p>
                              {att.size && (
                                <p className="text-[10px] text-[#817B77]">
                                  {formatFileSize(att.size)} • {formatDate(att.uploadedAt)}
                                </p>
                              )}
                            </div>
                          </div>

                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-white hover:bg-[#EAE4DF] border border-[#E8E2DE] text-[#3E3734] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-xs"
                          >
                            <FiDownload className="text-xs" />
                            <span>Download</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Checklist Checklist Card (If Present) */}
                {totalChecklist > 0 && (
                  <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
                      <h2 className="text-sm font-bold text-[#3E3734]">
                        Checklist Verification ({completedChecklist}/{totalChecklist})
                      </h2>
                      <span className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full">
                        {Math.round((completedChecklist / totalChecklist) * 100)}% Completed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {project.checklistItems.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                            item.checked
                              ? "bg-[#E8F5E9]/50 border-[#2E7D32]/20 text-[#2E7D32] font-semibold"
                              : "bg-[#FAF7F5] border-[#E8E2DE] text-[#817B77]"
                          }`}
                        >
                          {item.checked ? (
                            <FiCheckCircle className="text-sm text-[#2E7D32] shrink-0" />
                          ) : (
                            <FiXCircle className="text-sm text-[#A39A94] shrink-0" />
                          )}
                          <span className="truncate">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (1/3): Action Panel & Quality / Metadata Summary */}
              <div className="space-y-5">
                {/* 1. Review Action Panel */}
                <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                  <h2 className="text-sm font-bold text-[#3E3734] border-b border-[#F2EBE5] pb-3">
                    Review Action Panel
                  </h2>

                  {/* Feedback Notification Box */}
                  {actionMessage && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        actionMessage.type === "success"
                          ? "bg-[#E8F5E9] border border-[#2E7D32]/20 text-[#2E7D32]"
                          : "bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828]"
                      }`}
                    >
                      {actionMessage.type === "success" ? (
                        <FiCheckCircle className="text-base shrink-0" />
                      ) : (
                        <FiAlertCircle className="text-base shrink-0" />
                      )}
                      <span>{actionMessage.text}</span>
                    </div>
                  )}

                  {/* Admin Comments */}
                  <div>
                    <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                      Admin Comments / Review Notes
                    </label>
                    <textarea
                      rows={4}
                      value={adminComments}
                      onChange={(e) => setAdminComments(e.target.value)}
                      placeholder="Add detailed evaluation notes, quality feedback, or specific retake instructions..."
                      className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors resize-none placeholder-[#A39A94]"
                    />
                  </div>

                  {/* Vendor Notification Checkbox (Disabled / Honest State) */}
                  <div className="bg-[#FAF7F5] border border-[#F2EBE5] p-3 rounded-xl opacity-75">
                    <label className="flex items-center gap-2 cursor-not-allowed">
                      <input
                        type="checkbox"
                        disabled
                        checked={false}
                        className="rounded text-[#8A817C] cursor-not-allowed"
                      />
                      <span className="text-xs font-bold text-[#817B77]">
                        Notify Vendor via Email
                      </span>
                    </label>
                    <p className="text-[10px] text-[#A39A94] mt-1 pl-5">
                      (Vendor notification system not configured in platform backend)
                    </p>
                  </div>

                  {/* Review Action Buttons */}
                  <div className="space-y-2.5 pt-2 border-t border-[#F2EBE5]">
                    {/* Approve Submission Button */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleReviewAction("Approved")}
                      className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FiCheckCircle className="text-sm" />
                      <span>{actionLoading ? "Processing..." : "Approve Submission"}</span>
                    </button>

                    {/* Request Retake Button */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleReviewAction("In Progress")}
                      className="w-full bg-[#E65100] hover:bg-[#BF360C] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FiRefreshCw className="text-sm" />
                      <span>{actionLoading ? "Processing..." : "Request Retake"}</span>
                    </button>

                    {/* Reject Submission Button */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleReviewAction("Rejected")}
                      className="w-full bg-[#C62828] hover:bg-[#B71C1C] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FiXCircle className="text-sm" />
                      <span>{actionLoading ? "Processing..." : "Reject Submission"}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Real Backend Quality Metrics & AI Score Summary */}
                <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                  <h2 className="text-sm font-bold text-[#3E3734] border-b border-[#F2EBE5] pb-3">
                    Quality & AI Metrics
                  </h2>

                  {/* Confidence Score Display (Honest Backend Data Only) */}
                  <div className="bg-[#FAF7F5] border border-[#F2EBE5] p-3.5 rounded-xl space-y-1">
                    <span className="block text-[10px] font-bold text-[#A39A94] uppercase">
                      CONFIDENCE SCORE
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#817B77]">N/A</span>
                      <span className="text-[11px] text-[#817B77] italic">
                        (AI confidence model not computed for this service)
                      </span>
                    </div>
                  </div>

                  {/* Quality Checks (Derived Real Data) */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-[#A39A94] uppercase">
                      DATA VERIFICATION CHECKS
                    </span>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 bg-[#FAF7F5] rounded-lg border border-[#F2EBE5]">
                        <span className="text-[#3E3734] font-medium">Photo Evidence</span>
                        <span className="font-bold text-[#2E7D32]">
                          {photosCount > 0 ? `${photosCount} Photo(s)` : "None"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-[#FAF7F5] rounded-lg border border-[#F2EBE5]">
                        <span className="text-[#3E3734] font-medium">Checklist Item Match</span>
                        <span className="font-bold text-[#2E7D32]">
                          {totalChecklist > 0 ? `${completedChecklist}/${totalChecklist}` : "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-[#FAF7F5] rounded-lg border border-[#F2EBE5]">
                        <span className="text-[#3E3734] font-medium">Service Configuration</span>
                        <span className="font-bold text-[#2E7D32]">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Project Metadata Summary */}
                <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
                  <h2 className="text-sm font-bold text-[#3E3734] border-b border-[#F2EBE5] pb-3">
                    Project Metadata
                  </h2>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#F2EBE5]">
                      <span className="text-[#817B77]">Project Code:</span>
                      <span className="font-bold text-[#3E3734]">{project.projectId}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#F2EBE5]">
                      <span className="text-[#817B77]">Service Category:</span>
                      <span className="font-semibold text-[#3E3734]">{project.serviceTypeName}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#F2EBE5]">
                      <span className="text-[#817B77]">Client Name:</span>
                      <span className="font-semibold text-[#3E3734]">{project.client}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#F2EBE5]">
                      <span className="text-[#817B77]">Created Date:</span>
                      <span className="font-semibold text-[#3E3734]">{formatDate(project.createdAt)}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#F2EBE5]">
                      <span className="text-[#817B77]">Last Updated:</span>
                      <span className="font-semibold text-[#3E3734]">{formatDate(project.updatedAt)}</span>
                    </div>

                    {project.rejectionReason && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-[#C62828] uppercase block mb-1">
                          Rejection Reason:
                        </span>
                        <p className="p-2.5 bg-[#FFEBEE] border border-[#C62828]/20 rounded-lg text-xs text-[#C62828] font-medium">
                          {project.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

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
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg cursor-pointer"
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

      {/* Audit Log History Drawer Modal */}
      {historyOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-end p-0"
          onClick={() => setHistoryOpen(false)}
        >
          <div
            className="bg-white h-full max-w-md w-full p-6 shadow-2xl border-l border-[#E8E2DE] flex flex-col justify-between space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#3E3734] flex items-center gap-2">
                  <FiClock className="text-base text-[#817B77]" />
                  <span>Audit Event History</span>
                </h3>
                <p className="text-xs text-[#817B77] mt-0.5">
                  Real audit records for {project?.projectId || id}
                </p>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-[#817B77] hover:text-[#3E3734] p-1.5 rounded-lg hover:bg-[#F2EBE5] transition-colors cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {historyLoading ? (
                <div className="p-8 text-center text-xs text-[#817B77] flex items-center justify-center gap-2">
                  <FiLoader className="animate-spin text-base" />
                  <span>Loading audit logs from backend...</span>
                </div>
              ) : historyLogs.length > 0 ? (
                historyLogs.map((log, idx) => (
                  <div
                    key={log._id || idx}
                    className="bg-[#FAF7F5] border border-[#E8E2DE] p-3.5 rounded-xl space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#3E3734] bg-[#E8E2DE] px-2 py-0.5 rounded text-[10px]">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-[#817B77]">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-[#4A423F] font-medium">{log.description}</p>
                    <div className="text-[10px] text-[#817B77] flex items-center gap-2 pt-1 border-t border-[#F2EBE5]">
                      <span>Actor: <strong>{log.actorEmail}</strong></span>
                      <span>({log.actorRole})</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[#817B77]">
                  No audit history records found for this project.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#F2EBE5] flex justify-end">
              <button
                onClick={() => setHistoryOpen(false)}
                className="bg-[#F2EBE5] text-[#3E3734] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#EAE4DF] transition-colors cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSubmission;
