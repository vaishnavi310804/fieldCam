import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiCalendar,
  FiCamera,
  FiEye,
  FiUser,
} from "react-icons/fi";

const StaffProjectCard = ({ project }) => {
  const navigate = useNavigate();

  if (!project) return null;

  // Calculate isOverdue safely from deadline
  const isOverdue = (() => {
    if (!project.deadline) return false;
    const deadlineDate = new Date(project.deadline);
    if (isNaN(deadlineDate.getTime())) return false;
    return (
      deadlineDate < new Date() &&
      project.status !== "Approved" &&
      project.status !== "Completed"
    );
  })();

  // Display Status Mapping
  let statusLabel = project.status || "Assigned";
  if (isOverdue) {
    statusLabel = "Overdue";
  }

  // Status Badge Colors
  const getStatusBadgeStyle = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "NEW":
        return "bg-[#3498DB] text-white";
      case "ASSIGNED":
        return "bg-[#2563EB] text-white";
      case "IN PROGRESS":
        return "bg-[#E67E22] text-white";
      case "SUBMITTED":
      case "UNDER REVIEW":
        return "bg-[#9B59B6] text-white";
      case "COMPLETED":
      case "APPROVED":
        return "bg-[#2ECC71] text-white";
      case "OVERDUE":
      case "REJECTED":
        return "bg-[#E74C3C] text-white";
      default:
        return "bg-slate-600 text-white";
    }
  };

  // Progress Bar Colors
  const getProgressBarColor = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "NEW":
        return "bg-[#3498DB]";
      case "ASSIGNED":
        return "bg-[#2563EB]";
      case "IN PROGRESS":
        return "bg-[#E67E22]";
      case "SUBMITTED":
      case "UNDER REVIEW":
        return "bg-[#9B59B6]";
      case "COMPLETED":
      case "APPROVED":
        return "bg-[#2ECC71]";
      case "OVERDUE":
      case "REJECTED":
        return "bg-[#E74C3C]";
      default:
        return "bg-[#5141F5]";
    }
  };

  // Format Date
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Progress Percentage Calculation from checklistItems
  const checklist = Array.isArray(project.checklistItems) ? project.checklistItems : [];
  const checkedCount = checklist.filter((item) => item.checked).length;
  const totalCount = checklist.length;

  const statusUpper = (project.status || "").toUpperCase();

  let progressPercentage = null;
  if (totalCount > 0) {
    progressPercentage = Math.round((checkedCount / totalCount) * 100);
  } else if (statusUpper === "APPROVED" || statusUpper === "COMPLETED") {
    progressPercentage = 100;
  } else if (statusUpper === "IN PROGRESS") {
    progressPercentage = 50;
  } else if (statusUpper === "SUBMITTED" || statusUpper === "UNDER REVIEW") {
    progressPercentage = 85;
  } else if (statusUpper === "ASSIGNED" || statusUpper === "NEW") {
    progressPercentage = 0;
  }

  // Cover Image from Presigned S3 URL
  const coverImage =
    Array.isArray(project.photos) && project.photos.length > 0
      ? project.photos[0]?.url
      : null;

  // Photo Count
  const photoCount = Array.isArray(project.photos) ? project.photos.length : 0;

  // Service Category Tag
  const categoryTag =
    project.serviceTypeName ||
    project.serviceId?.serviceTypeName ||
    "Field Assignment";

  const clientName = project.client || "—";
  const vendorName =
    project.vendorName ||
    project.vendorId?.companyName ||
    project.vendorId?.contactName ||
    "Vendor Partner";

  const projectMongoId = project._id || project.id;

  const handleViewDetails = () => {
    navigate(`/staff/projects/${projectMongoId}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E2DE] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Card Header / Cover Media */}
        <div className="relative h-44 w-full bg-[#3E3734] overflow-hidden flex items-center justify-center">
          {coverImage ? (
            <img
              src={coverImage}
              alt={project.projectName || "Project"}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white/40 gap-1.5">
              <FiCamera size={28} />
              <span className="text-[10px] font-medium">No Project Photos</span>
            </div>
          )}

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Top-Left: Status Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-xs ${getStatusBadgeStyle(
                statusLabel
              )}`}
            >
              ● {statusLabel}
            </span>
          </div>

          {/* Top-Right: Project ID */}
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-black/50 text-white backdrop-blur-xs text-[10px] font-mono px-2 py-0.5 rounded-md border border-white/20">
              {project.projectId || "PRJ-0000"}
            </span>
          </div>

          {/* Bottom-Right: Photo Count Pill */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="bg-black/60 text-white backdrop-blur-xs text-[10px] font-medium px-2 py-0.5 rounded-lg border border-white/20 flex items-center gap-1">
              <FiCamera size={11} />
              <span>{photoCount} photos</span>
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          {/* Service Category Tag */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-block bg-[#EEF0FF] text-[#5141F5] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              {categoryTag}
            </span>
            <span className="text-[10px] font-medium text-[#817B77] truncate">
              Client: <strong className="text-[#3E3734]">{clientName}</strong>
            </span>
          </div>

          {/* Title */}
          <h3
            title={project.projectName}
            className="text-sm font-bold text-[#202020] leading-snug line-clamp-1"
          >
            {project.projectName || "Untitled Project"}
          </h3>

          {/* Location & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#777] pt-0.5">
            <div className="flex items-center gap-1.5 truncate">
              <FiMapPin className="text-[#817B77] shrink-0 text-xs" />
              <span className="truncate">{project.location || "—"}</span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <FiCalendar className="text-[#817B77] shrink-0 text-xs" />
              <span>{formatDate(project.deadline)}</span>
            </div>
          </div>

          {/* Vendor Partner */}
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-[#817B77]">Vendor</span>
            <div className="flex items-center gap-1.5 font-medium text-[#333]">
              <FiUser className="text-xs text-[#817B77]" />
              <span className="truncate">{vendorName}</span>
            </div>
          </div>

          {/* Progress Bar Section */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-[#817B77] mb-1">
              <span>Photo Progress</span>
              <span className="text-[#333]">
                {progressPercentage !== null ? `${progressPercentage}%` : "—"}
              </span>
            </div>

            <div className="w-full h-1.5 bg-[#EAE4DF] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${getProgressBarColor(
                  statusLabel
                )}`}
                style={{
                  width: `${progressPercentage !== null ? progressPercentage : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions Footer - STRICTLY ONLY VIEW DETAILS */}
      <div className="p-4 pt-0 mt-2">
        <button
          type="button"
          onClick={handleViewDetails}
          className="w-full h-9 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] hover:bg-[#EAE4DF] text-[#3E3734] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <FiEye size={13} />
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
};

export default StaffProjectCard;
