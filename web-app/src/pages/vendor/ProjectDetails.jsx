import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import VendorHeader from "../../components/vendor/VendorHeader";
import {
  getProjectById,
  addProjectNote,
  acceptProject,
} from "../../services/projectService";
import { getMyVendorProfile } from "../../services/vendorService";
import { useAuth } from "../../context/AuthContext";
import {
  FiArrowLeft,
  FiMapPin,
  FiUser,
  FiClock,
  FiCamera,
  FiMaximize2,
  FiX,
  FiAlertCircle,
  FiMessageSquare,
  FiPlus,
  FiShare2,
  FiRefreshCw,
  FiLoader,
  FiBarChart2,
  FiUsers,
  FiChevronRight,
  FiCheck,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";
import { getProjectProgress } from "../../utils/projectProgress";

const VendorProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorProfile, setVendorProfile] = useState(null);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Acceptance state
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptSuccess, setAcceptSuccess] = useState(null);
  const [acceptError, setAcceptError] = useState(null);

  // Notes state
  const [notesList, setNotesList] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState(null);
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);

  // Lightbox preview state
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  // Share link feedback
  const [copied, setCopied] = useState(false);

  const handleAcceptProject = async () => {
    if (!project || isAccepting) return;
    const targetId = project._id || project.projectId || id;

    try {
      setIsAccepting(true);
      setAcceptError(null);
      await acceptProject(targetId);
      setAcceptSuccess(
        "Project accepted successfully! It is now assigned to your organization and ready for staff assignment."
      );
      await fetchProjectData();
    } catch (err) {
      setAcceptError(
        err.response?.data?.message ||
          err.message ||
          "Failed to accept project. Please try again."
      );
    } finally {
      setIsAccepting(false);
    }
  };

  const fetchProjectData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, vendorRes] = await Promise.all([
        getProjectById(id),
        getMyVendorProfile().catch(() => null),
      ]);

      const data = projRes.data || projRes;
      setProject(data);
      setNotesList(Array.isArray(data.notes) ? data.notes : []);

      if (vendorRes) {
        setVendorProfile(vendorRes.data || vendorRes);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load project details from server."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    Promise.all([
      getProjectById(id),
      getMyVendorProfile().catch(() => null),
    ])
      .then(([projRes, vendorRes]) => {
        if (!active) return;
        const data = projRes.data || projRes;
        setProject(data);
        setNotesList(Array.isArray(data.notes) ? data.notes : []);
        if (vendorRes) {
          setVendorProfile(vendorRes.data || vendorRes);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load project details from server."
        );
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsSubmittingNote(true);
    setNoteError(null);
    try {
      const projectIdToUse = project?._id || project?.projectId || id;
      const res = await addProjectNote(projectIdToUse, newNoteText.trim());
      const addedNote = res.data || res;

      // Update local notes state immediately
      setNotesList((prev) => [...prev, addedNote]);
      setNewNoteText("");
      setShowAddNoteForm(false);
    } catch (err) {
      setNoteError(
        err.response?.data?.message || err.message || "Failed to add note."
      );
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format date & time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Business metrics calculation
  const statusUpper = (project?.status || "").toUpperCase();
  const isApproved = statusUpper === "APPROVED" || statusUpper === "COMPLETED";
  const isSubmittedOrBeyond =
    statusUpper === "SUBMITTED" ||
    statusUpper === "UNDER REVIEW" ||
    isApproved;

  const checklist = Array.isArray(project?.checklistItems)
    ? project.checklistItems
    : [];
  const totalChecklist = checklist.length;
  const checkedCount = checklist.filter((item) => item.checked).length;

  const photos = Array.isArray(project?.photos) ? project.photos : [];
  const photosCount = photos.length;

  // Project Progress calculation based on FieldCam rules
  const progressPercentage = getProjectProgress(
    project?.status,
    project?.checklistItems,
    project?.progress
  );

  // Days remaining calculation
  const daysDiff = (() => {
    if (!project?.deadline) return null;
    const deadlineDate = new Date(project.deadline);
    if (isNaN(deadlineDate.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  })();

  const isOverdue = daysDiff !== null && daysDiff < 0 && !isApproved;

  // Checklist counts & rejected photos
  const rejectedPhotosCount = photos.filter(
    (p) =>
      p.aiValidation?.status === "FAILED" ||
      p.status === "REJECTED" ||
      p.status === "Rejected"
  ).length;

  const approvedPhotosCount = isApproved
    ? photosCount
    : photos.filter(
        (p) =>
          p.aiValidation?.status === "PASSED" ||
          p.status === "APPROVED" ||
          p.status === "Approved"
      ).length;

  const pendingPhotosCount = Math.max(
    0,
    totalChecklist - checkedCount
  );

  // Status Badge Colors
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "New":
        return "bg-[#3498DB] text-white";
      case "ASSIGNED":
        return "bg-[#2563EB] text-white";
      case "In Progress":
        return "bg-[#E67E22] text-white";
      case "Submitted":
      case "Under Review":
        return "bg-[#9B59B6] text-white";
      case "Completed":
      case "Approved":
        return "bg-[#2ECC71] text-white";
      case "Overdue":
      case "Rejected":
        return "bg-[#E74C3C] text-white";
      default:
        return "bg-[#3E3734] text-white";
    }
  };

  const coverImage = photos.length > 0 ? photos[0]?.url : null;

  const vendorDisplayName =
    vendorProfile?.companyName ||
    vendorProfile?.userId?.name ||
    user?.name ||
    "Vendor Partner";

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      {/* Vendor Sidebar */}
      <VendorSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container Area */}
      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Vendor Header */}
        <VendorHeader
          title="Project Details"
          vendorName={vendorDisplayName}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Breadcrumbs & Navigation Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E8E2DE] p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#817B77]">
              <Link
                to="/vendor/projects"
                className="hover:text-[#3E3734] flex items-center gap-1 transition-colors"
              >
                <FiArrowLeft className="text-sm" />
                <span>Projects</span>
              </Link>
              <span className="text-[#C8B5AC]">•</span>
              <span>Project Details</span>
              {project?.projectId && (
                <>
                  <span className="text-[#C8B5AC]">•</span>
                  <span className="font-bold text-[#3E3734]">
                    {project.projectId}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 bg-[#FAF7F5] border border-[#E8E2DE] hover:bg-[#F2EBE5] text-[#3E3734] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                title="Copy shareable link"
              >
                <FiShare2 className="text-xs text-[#817B77]" />
                <span>{copied ? "Link Copied!" : "Share"}</span>
              </button>

              <button
                type="button"
                onClick={fetchProjectData}
                className="flex items-center gap-1.5 bg-[#FAF7F5] border border-[#E8E2DE] hover:bg-[#F2EBE5] text-[#3E3734] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                title="Refresh project details"
              >
                <FiRefreshCw className="text-xs text-[#817B77]" />
                <span>Refresh</span>
              </button>

              {project && project.status === "New" && (
                <button
                  type="button"
                  disabled={isAccepting}
                  onClick={handleAcceptProject}
                  className="flex items-center gap-1.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Accept this assigned project"
                >
                  {isAccepting ? (
                    <>
                      <FiLoader className="animate-spin text-xs" />
                      <span>Accepting...</span>
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="text-xs" />
                      <span>Accept Project</span>
                    </>
                  )}
                </button>
              )}

              {project && project.status === "ASSIGNED" && (
                <Link
                  to={`/vendor/staff?projectId=${project._id || project.projectId || id}`}
                  className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  title="Assign project to staff member"
                >
                  <FiUsers className="text-xs" />
                  <span>Assign Staff</span>
                </Link>
              )}

              {project && project.status === "Approved" && (
                <Link
                  to={`/vendor/invoices?projectId=${project._id || project.projectId || id}`}
                  className="flex items-center gap-1.5 bg-[#00B894] hover:bg-[#00A383] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  title="Raise Invoice for this approved project"
                >
                  <FiFileText className="text-xs" />
                  <span>Raise Invoice</span>
                </Link>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-12 text-center text-xs text-[#817B77] space-y-2 shadow-xs">
              <FiLoader className="animate-spin text-2xl mx-auto text-[#8A817C]" />
              <p className="font-semibold">Loading project details from platform service...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={fetchProjectData}
                className="flex items-center gap-1.5 bg-[#C62828] text-white px-3 py-1.5 rounded-xl font-bold hover:bg-[#B71C1C] transition-colors cursor-pointer"
              >
                <FiRefreshCw className="text-xs" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {!loading && !error && project && (
            <div className="space-y-6">
              {/* Acceptance Feedback Alerts */}
              {acceptSuccess && (
                <div className="bg-[#E8F5E9] border border-[#2E7D32]/20 text-[#2E7D32] p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-base shrink-0" />
                    <span>{acceptSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAcceptSuccess(null)}
                    className="text-[#2E7D32] hover:opacity-75 p-1 cursor-pointer"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}

              {acceptError && (
                <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <FiAlertCircle className="text-base shrink-0" />
                    <span>{acceptError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAcceptError(null)}
                    className="text-[#C62828] hover:opacity-75 p-1 cursor-pointer"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}

              {/* Status Action Banners */}
              {project.status === "New" && (
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5">
                      <FiAlertCircle size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1E40AF]">Assignment Awaiting Vendor Acceptance</h3>
                      <p className="text-xs text-[#3B82F6] mt-0.5 leading-relaxed">
                        This project has been assigned to your organization. Accept the assignment to confirm ownership and unlock staff assignment for field operations.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isAccepting}
                    onClick={handleAcceptProject}
                    className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 shadow-xs cursor-pointer"
                  >
                    {isAccepting ? (
                      <>
                        <FiLoader className="animate-spin text-xs" />
                        <span>Accepting...</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle size={15} />
                        <span>Accept Project</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {project.status === "ASSIGNED" && (
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
                      <FiCheckCircle size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#166534]">Project Accepted • Ready for Staff Assignment</h3>
                      <p className="text-xs text-[#15803D] mt-0.5 leading-relaxed">
                        Assignment confirmed. You can now select and assign a field staff member from your team to start photo capture.
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/vendor/staff?projectId=${project._id || project.projectId || id}`}
                    className="bg-[#15803D] hover:bg-[#166534] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0 shadow-xs cursor-pointer"
                  >
                    <FiUsers size={15} />
                    <span>Assign to Staff</span>
                  </Link>
                </div>
              )}

              {/* 1. TOP HERO / OVERVIEW CARD */}
              <div className="bg-white border border-[#E8E2DE] rounded-2xl overflow-hidden shadow-xs">
                {/* Hero Banner with Cover Photo & Dark Gradient Overlay */}
                <div className="relative h-64 sm:h-72 w-full bg-[#3E3734] overflow-hidden flex items-end">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={project.projectName}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#2D2725] flex flex-col items-center justify-center text-white/30 gap-2">
                      <FiCamera size={44} />
                      <span className="text-xs font-medium">No Project Cover Photo</span>
                    </div>
                  )}

                  {/* Gradient Overlay for Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />

                  {/* Hero Information Content */}
                  <div className="relative z-10 p-6 sm:p-8 space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-xs ${getStatusBadgeStyle(
                          isOverdue ? "Overdue" : project.status
                        )}`}
                      >
                        ● {isOverdue ? "Overdue" : project.status}
                      </span>

                      <span className="bg-white/20 text-white backdrop-blur-xs text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 uppercase tracking-wider">
                        {project.serviceTypeName ||
                          project.serviceId?.serviceTypeName ||
                          "Field Inspection"}
                      </span>

                      <span className="bg-black/40 text-white backdrop-blur-xs text-[10px] font-mono px-2 py-0.5 rounded-md border border-white/20 ml-auto">
                        {project.projectId}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-sm">
                      {project.projectName}
                    </h1>

                    <div className="flex items-center gap-1.5 text-xs text-white/90">
                      <FiMapPin className="shrink-0 text-white" />
                      <span>{project.location || "Location not specified"}</span>
                    </div>
                  </div>
                </div>

                {/* Property / Project Information 6-Item Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs bg-[#FAF7F5] border border-[#F2EBE5] p-4 rounded-xl">
                    <div className="space-y-0.5 min-w-0">
                      <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        CLIENT
                      </span>
                      <span className="font-bold text-[#3E3734] truncate block">
                        {project.client || "—"}
                      </span>
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        CONTACT
                      </span>
                      <span className="font-bold text-[#3E3734] truncate block">
                        {project.vendorId?.contactName ||
                          project.vendorName ||
                          "Amanda Foster"}
                      </span>
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        WORK TYPE
                      </span>
                      <span className="font-bold text-[#3E3734] truncate block">
                        {project.serviceTypeName ||
                          project.serviceId?.serviceTypeName ||
                          "Field Service"}
                      </span>
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        PROPERTY SIZE
                      </span>
                      <span className="font-bold text-[#3E3734] truncate block">
                        {project.propertySize || "N/A"}
                      </span>
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        DUE DATE
                      </span>
                      <span className="font-bold text-[#3E3734] block">
                        {formatDate(project.deadline)}
                      </span>
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        ASSIGNED
                      </span>
                      <span className="font-bold text-[#3E3734] block">
                        {formatDate(project.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Scope / Instructions if available */}
                  {project.description && (
                    <div className="mt-4 text-xs text-[#6E6763] bg-[#FAF7F5] p-3.5 rounded-xl border border-[#F2EBE5]">
                      <span className="font-bold text-[#3E3734] block mb-1">
                        Project Scope / Field Instructions:
                      </span>
                      <p className="leading-relaxed">{project.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. LOCATION SECTION CARD */}
              <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#F2EBE5] pb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#EEF0FF] text-[#5141F5] flex items-center justify-center text-sm font-bold">
                    <FiMapPin />
                  </div>
                  <h2 className="text-sm font-bold text-[#3E3734]">Location</h2>
                </div>

                <div className="space-y-3">
                  {/* Map Container */}
                  <div className="w-full h-56 rounded-xl overflow-hidden border border-[#E8E2DE] bg-[#FAF7F5] relative">
                    {project.location ? (
                      <iframe
                        title="Project Location Map"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(
                          project.location
                        )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-[#817B77] text-xs gap-1">
                        <FiMapPin size={24} className="text-[#A39A94]" />
                        <span>Address not mapped</span>
                      </div>
                    )}
                  </div>

                  {/* Location Address Pill */}
                  <div className="inline-flex items-center gap-2 bg-[#FAF7F5] border border-[#E8E2DE] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#3E3734]">
                    <FiMapPin className="text-[#5141F5] text-sm shrink-0" />
                    <span>{project.location || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* 3. PHOTO CHECKLIST SECTION CARD */}
              <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2EBE5] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#F3E5F5] text-[#9C27B0] flex items-center justify-center text-sm font-bold">
                      <FiCamera />
                    </div>
                    <h2 className="text-sm font-bold text-[#3E3734]">
                      Photo Checklist
                    </h2>
                  </div>

                  {/* Status counts badges */}
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1 text-[#2ECC71]">
                      <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
                      <span>{approvedPhotosCount} Approved</span>
                    </span>
                    <span className="flex items-center gap-1 text-[#E74C3C]">
                      <span className="w-2 h-2 rounded-full bg-[#E74C3C]" />
                      <span>{rejectedPhotosCount} Rejected</span>
                    </span>
                    <span className="flex items-center gap-1 text-[#817B77]">
                      <span className="w-2 h-2 rounded-full bg-[#A39A94]" />
                      <span>{pendingPhotosCount} Pending</span>
                    </span>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#817B77]">
                    <span>Overall Progress</span>
                    <span className="text-[#3E3734]">
                      {photosCount}/{totalChecklist || photosCount} photos •{" "}
                      {progressPercentage}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#EAE4DF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8C7E74] transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Checklist Items List */}
                <div className="space-y-2.5 pt-2">
                  {checklist.length > 0 ? (
                    checklist.map((item, idx) => {
                      // Find matched photo if uploaded
                      const matchedPhoto = photos.find(
                        (p) =>
                          p.checklistItemId === item.id ||
                          p.caption?.toLowerCase() === item.label?.toLowerCase()
                      ) || photos[idx];

                      const isItemRejected =
                        matchedPhoto?.aiValidation?.status === "FAILED" ||
                        matchedPhoto?.status === "Rejected" ||
                        matchedPhoto?.status === "REJECTED";

                      const isItemUploaded =
                        item.checked ||
                        matchedPhoto ||
                        isApproved;

                      return (
                        <div
                          key={item.id || idx}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isItemRejected
                              ? "bg-[#FFEBEE]/40 border-[#E74C3C]/30"
                              : isItemUploaded
                              ? "bg-[#FAF7F5] border-[#E8E2DE]"
                              : "bg-white border-[#E8E2DE]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Status Icon Indicator */}
                              {isItemRejected ? (
                                <div className="w-6 h-6 rounded-full bg-[#FFEBEE] text-[#E74C3C] flex items-center justify-center shrink-0">
                                  <FiAlertCircle size={14} />
                                </div>
                              ) : isItemUploaded ? (
                                <div className="w-6 h-6 rounded-full bg-[#E8F5E9] text-[#2ECC71] flex items-center justify-center shrink-0">
                                  <FiCheck size={14} />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-[#F2EBE5] text-[#A39A94] flex items-center justify-center shrink-0">
                                  <span className="w-2 h-2 rounded-full bg-[#C8B5AC]" />
                                </div>
                              )}

                              {/* Photo Thumbnail if available */}
                              {matchedPhoto?.url ? (
                                <div
                                  onClick={() => {
                                    setPreviewImage(matchedPhoto.url);
                                    setPreviewTitle(item.label || matchedPhoto.caption || "Checklist Photo");
                                  }}
                                  className="w-10 h-10 rounded-lg overflow-hidden bg-[#EAE4DF] shrink-0 border border-[#E8E2DE] cursor-pointer hover:opacity-80 transition-opacity relative group"
                                  title="Click to preview image"
                                >
                                  <img
                                    src={matchedPhoto.url}
                                    alt={item.label}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <FiMaximize2 size={12} />
                                  </div>
                                </div>
                              ) : null}

                              {/* Item Label */}
                              <span className="text-xs font-bold text-[#3E3734] truncate">
                                {item.label}
                              </span>
                            </div>

                            {/* Right Status Badge */}
                            <div>
                              {isItemRejected ? (
                                <span className="text-[11px] font-bold text-[#E74C3C] bg-[#FFEBEE] px-2.5 py-0.5 rounded-full">
                                  Rejected
                                </span>
                              ) : isItemUploaded ? (
                                <span className="text-[11px] font-bold text-[#2ECC71] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full">
                                  {isApproved ? "Approved" : "Uploaded"}
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-[#817B77] bg-[#FAF7F5] px-2.5 py-0.5 rounded-full border border-[#E8E2DE]">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Rejection Notice Banner if rejected */}
                          {isItemRejected && (
                            <div className="mt-2.5 pt-2 border-t border-[#E74C3C]/20 text-[11px] text-[#C62828] font-medium flex items-center gap-1.5">
                              <FiAlertCircle className="shrink-0 text-xs" />
                              <span>
                                {matchedPhoto?.aiValidation?.reason ||
                                  project.rejectionReason ||
                                  "Photo requires retake based on review feedback."}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : photos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {photos.map((photo, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => {
                            setPreviewImage(photo.url);
                            setPreviewTitle(photo.caption || `Evidence Photo #${pIdx + 1}`);
                          }}
                          className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl overflow-hidden cursor-pointer hover:border-[#C8B5AC] transition-all shadow-xs group"
                        >
                          <div className="aspect-video w-full bg-[#EAE4DF] overflow-hidden relative">
                            <img
                              src={photo.url}
                              alt={photo.caption || `Photo ${pIdx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <FiMaximize2 size={14} />
                            </div>
                          </div>
                          <div className="p-2 bg-white">
                            <p className="text-[11px] font-bold text-[#3E3734] truncate">
                              {photo.caption || `Photo #${pIdx + 1}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#FAF7F5] border border-dashed border-[#E8E2DE] rounded-xl p-6 text-center text-xs text-[#817B77]">
                      No checklist items or photos attached to this project.
                    </div>
                  )}
                </div>
              </div>

              {/* 4. QUICK STATS CARD */}
              <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#F2EBE5] pb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center text-sm font-bold">
                    <FiBarChart2 />
                  </div>
                  <h2 className="text-sm font-bold text-[#3E3734]">Quick Stats</h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Photos */}
                  <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-2xl p-4 text-center space-y-1">
                    <span className="block text-2xl font-extrabold text-[#3730A3]">
                      {photosCount}/{totalChecklist || photosCount}
                    </span>
                    <span className="block text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">
                      PHOTOS
                    </span>
                  </div>

                  {/* Card 2: Progress */}
                  <div className="bg-[#FEF9C3] border border-[#FEF08A] rounded-2xl p-4 text-center space-y-1">
                    <span className="block text-2xl font-extrabold text-[#854D0E]">
                      {progressPercentage}%
                    </span>
                    <span className="block text-[10px] font-bold text-[#CA8A04] uppercase tracking-wider">
                      PROGRESS
                    </span>
                  </div>

                  {/* Card 3: Days Remaining */}
                  <div
                    className={`rounded-2xl p-4 text-center space-y-1 border ${
                      isOverdue
                        ? "bg-[#FFEBEE] border-[#FFCDD2]"
                        : "bg-[#ECFEFF] border-[#CFFAFE]"
                    }`}
                  >
                    <span
                      className={`block text-2xl font-extrabold ${
                        isOverdue ? "text-[#C62828]" : "text-[#155E75]"
                      }`}
                    >
                      {daysDiff !== null
                        ? isOverdue
                          ? Math.abs(daysDiff)
                          : daysDiff
                        : "—"}
                    </span>
                    <span
                      className={`block text-[10px] font-bold uppercase tracking-wider ${
                        isOverdue ? "text-[#D32F2F]" : "text-[#06B6D4]"
                      }`}
                    >
                      {isOverdue ? "DAYS OVERDUE" : "DAYS LEFT"}
                    </span>
                  </div>

                  {/* Card 4: Critical / Issues */}
                  <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 text-center space-y-1">
                    <span className="block text-2xl font-extrabold text-[#065F46]">
                      {rejectedPhotosCount}
                    </span>
                    <span className="block text-[10px] font-bold text-[#059669] uppercase tracking-wider">
                      CRITICAL / REJECTED
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. ASSIGNED STAFF CARD */}
              <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#F2EBE5] pb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center text-sm font-bold">
                    <FiUsers />
                  </div>
                  <h2 className="text-sm font-bold text-[#3E3734]">
                    Assigned Staff
                  </h2>
                </div>

                {project.assignedStaffName || project.assignedStaffId ? (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#6366F1] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {(project.assignedStaffName || "Staff")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[#3E3734]">
                          {project.assignedStaffName || "Field Technician"}
                        </span>
                        <span className="block text-[10px] font-medium text-[#817B77]">
                          Field Operations Team Member
                        </span>
                      </div>
                    </div>

                    <FiChevronRight className="text-[#817B77] text-base" />
                  </div>
                ) : (
                  <div className="bg-[#FAF7F5] border border-dashed border-[#E8E2DE] rounded-xl p-6 text-center text-xs text-[#817B77] space-y-1">
                    <FiUser className="text-xl mx-auto text-[#A39A94]" />
                    <p className="font-semibold text-[#3E3734]">No Staff Assigned Yet</p>
                    <p>You can assign team members to this project from the Projects module.</p>
                  </div>
                )}
              </div>

              {/* 6. TIMELINE CARD */}
              <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#F2EBE5] pb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center text-sm font-bold">
                    <FiClock />
                  </div>
                  <h2 className="text-sm font-bold text-[#3E3734]">Timeline</h2>
                </div>

                <div className="space-y-4 pl-2 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAE4DF]">
                  {/* Step 1: Project Assigned */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-5 h-5 rounded-full bg-[#2ECC71] text-white flex items-center justify-center shrink-0 z-10 text-xs shadow-2xs">
                      <FiCheck size={12} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#3E3734]">
                        Project Assigned
                      </h4>
                      <p className="text-[11px] text-[#817B77]">
                        Assigned to {project.vendorName || "Vendor Partner"}
                      </p>
                      <span className="text-[10px] text-[#A39A94]">
                        {formatDateTime(project.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Photos Uploaded */}
                  <div className="flex items-start gap-3 relative">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 text-xs shadow-2xs ${
                        photosCount > 0
                          ? "bg-[#2ECC71] text-white"
                          : "bg-[#EAE4DF] text-[#817B77]"
                      }`}
                    >
                      {photosCount > 0 ? (
                        <FiCheck size={12} />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A39A94]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#3E3734]">
                        Photos Uploaded
                      </h4>
                      <p className="text-[11px] text-[#817B77]">
                        {photosCount > 0
                          ? `${photosCount} of ${totalChecklist || photosCount} photos uploaded`
                          : "Awaiting field photo uploads"}
                      </p>
                      {photosCount > 0 && photos[0]?.uploadedAt && (
                        <span className="text-[10px] text-[#A39A94]">
                          {formatDateTime(photos[0].uploadedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Work Submitted */}
                  <div className="flex items-start gap-3 relative">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 text-xs shadow-2xs ${
                        isSubmittedOrBeyond
                          ? "bg-[#2ECC71] text-white"
                          : "bg-[#EAE4DF] text-[#817B77]"
                      }`}
                    >
                      {isSubmittedOrBeyond ? (
                        <FiCheck size={12} />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A39A94]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#3E3734]">
                        Work Submitted
                      </h4>
                      <p className="text-[11px] text-[#817B77]">
                        {isSubmittedOrBeyond
                          ? "Project submitted for administrative quality review"
                          : "Pending vendor submission"}
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Client Approved */}
                  <div className="flex items-start gap-3 relative">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 text-xs shadow-2xs ${
                        isApproved
                          ? "bg-[#2ECC71] text-white"
                          : "bg-[#EAE4DF] text-[#817B77]"
                      }`}
                    >
                      {isApproved ? (
                        <FiCheck size={12} />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A39A94]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#3E3734]">
                        Client / Admin Approved
                      </h4>
                      <p className="text-[11px] text-[#817B77]">
                        {isApproved
                          ? "Inspection verified and approved"
                          : "Pending final client approval"}
                      </p>
                      {isApproved && project.updatedAt && (
                        <span className="text-[10px] text-[#A39A94]">
                          {formatDateTime(project.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. RECENT NOTES SECTION CARD */}
              <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF7F5] text-[#3E3734] border border-[#E8E2DE] flex items-center justify-center text-sm font-bold">
                      <FiMessageSquare />
                    </div>
                    <h2 className="text-sm font-bold text-[#3E3734]">
                      Recent Notes ({notesList.length})
                    </h2>
                  </div>

                  {!showAddNoteForm && (
                    <button
                      type="button"
                      onClick={() => setShowAddNoteForm(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#5141F5] hover:text-[#4535E8] transition-colors cursor-pointer"
                    >
                      <FiPlus size={14} />
                      <span>Add Note</span>
                    </button>
                  )}
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                  {notesList.length > 0 ? (
                    notesList.map((note, idx) => {
                      const author = note.authorName || "Vendor";
                      const authorInitials = author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <div
                          key={note._id || idx}
                          className="bg-[#FAF7F5] border border-[#E8E2DE] p-3.5 rounded-xl space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#C8B5AC] text-[#3E3734] font-bold text-[10px] flex items-center justify-center shrink-0">
                                {authorInitials}
                              </div>
                              <span className="font-bold text-[#3E3734]">
                                {author}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#817B77]">
                              {formatDateTime(note.createdAt)}
                            </span>
                          </div>
                          <p className="text-[#4A423F] font-medium pl-8 leading-relaxed">
                            {note.text}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-[#FAF7F5] border border-dashed border-[#E8E2DE] rounded-xl p-6 text-center text-xs text-[#817B77]">
                      No notes recorded for this project yet.
                    </div>
                  )}
                </div>

                {/* Add Note Form */}
                {showAddNoteForm && (
                  <form
                    onSubmit={handleAddNote}
                    className="pt-3 border-t border-[#F2EBE5] space-y-3"
                  >
                    {noteError && (
                      <div className="p-2.5 bg-[#FFEBEE] border border-[#C62828]/20 rounded-xl text-xs text-[#C62828] font-semibold flex items-center gap-2">
                        <FiAlertCircle className="shrink-0" />
                        <span>{noteError}</span>
                      </div>
                    )}

                    <textarea
                      rows={3}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Add an internal observation, field note, or update..."
                      className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors resize-none placeholder-[#A39A94]"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddNoteForm(false);
                          setNewNoteText("");
                          setNoteError(null);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-[#E8E2DE] bg-white text-xs font-semibold text-[#817B77] hover:bg-[#FAF7F5] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmittingNote || !newNoteText.trim()}
                        className="px-4 py-1.5 rounded-xl bg-[#3E3734] hover:bg-[#2A2523] text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {isSubmittingNote ? "Saving..." : "Save Note"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
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
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg cursor-pointer transition-colors"
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
    </div>
  );
};

export default VendorProjectDetails;
