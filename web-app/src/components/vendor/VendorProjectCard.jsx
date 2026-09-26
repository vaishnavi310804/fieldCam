import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiCalendar,
  FiCamera,
  FiUserCheck,
  FiEye,
  FiUserPlus,
} from "react-icons/fi";

const VendorProjectCard = ({ project, onAssignStaff }) => {
  const navigate = useNavigate();

  if (!project) return null;

  // Calculate isOverdue safely from deadline
  const isOverdue = (() => {
    if (!project.deadline) return false;
    const deadlineDate = new Date(project.deadline);
    if (isNaN(deadlineDate.getTime())) return false;
    return deadlineDate < new Date() && project.status !== "Approved";
  })();

  // Display Status Mapping
  let statusLabel = project.status || "New";
  if (isOverdue && project.status !== "Approved") {
    statusLabel = "Overdue";
  } else if (project.status === "Approved") {
    statusLabel = "Completed";
  }

  // Status Badge Colors
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "New":
        return "bg-[#3498DB] text-white";
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
        return "bg-slate-600 text-white";
    }
  };

  // Progress Bar Colors
  const getProgressBarColor = (status) => {
    switch (status) {
      case "New":
        return "bg-[#3498DB]";
      case "In Progress":
        return "bg-[#E67E22]";
      case "Submitted":
      case "Under Review":
        return "bg-[#9B59B6]";
      case "Completed":
      case "Approved":
        return "bg-[#2ECC71]";
      case "Overdue":
      case "Rejected":
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

  let progressPercentage = null;
  if (totalCount > 0) {
    progressPercentage = Math.round((checkedCount / totalCount) * 100);
  } else if (project.status === "Approved") {
    progressPercentage = 100;
  } else if (project.status === "New") {
    progressPercentage = 0;
  } else if (project.status === "In Progress") {
    progressPercentage = 50;
  } else if (project.status === "Submitted" || project.status === "Under Review") {
    progressPercentage = 85;
  }

  // Cover Image from Presigned S3 URL
  const coverImage = Array.isArray(project.photos) && project.photos.length > 0
    ? project.photos[0]?.url
    : null;

  // Photo Count
  const photoCount = Array.isArray(project.photos) ? project.photos.length : 0;

  // Assigned Staff / Contact Info
  const assigneeName =
    project.vendorId?.contactName ||
    project.vendorName ||
    "Unassigned";

  const assigneeInitials = assigneeName !== "Unassigned"
    ? assigneeName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  // Category Tag
  const categoryTag =
    project.serviceTypeName ||
    project.serviceId?.serviceTypeName ||
    "Field Operations";

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
          <div>
            <span className="inline-block bg-[#EEF0FF] text-[#5141F5] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              {categoryTag}
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

          {/* Assigned Contact / Staff */}
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-[#817B77]">Assigned Contact</span>
            <div className="flex items-center gap-1.5 font-medium text-[#333]">
              {assigneeInitials ? (
                <div className="w-5 h-5 rounded-full bg-[#C8B5AC] text-[#3E3734] font-bold text-[9px] flex items-center justify-center shrink-0">
                  {assigneeInitials}
                </div>
              ) : null}
              <span className="truncate">{assigneeName}</span>
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
                style={{ width: `${progressPercentage !== null ? progressPercentage : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2 mt-2">
        <button
          type="button"
          onClick={() => navigate(`/admin/projects/${project._id || project.id}/review`)}
          className="w-full h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] hover:bg-[#EAE4DF] text-[#3E3734] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <FiEye size={12} />
          <span>View Details</span>
        </button>

        <button
          type="button"
          onClick={() => (onAssignStaff ? onAssignStaff(project) : navigate(`/admin/projects/${project._id || project.id}/review`))}
          className="w-full h-8 rounded-xl bg-white border border-[#E8E2DE] hover:bg-[#FAF7F5] text-[#3E3734] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <FiUserPlus size={12} />
          <span>Assign Staff</span>
        </button>
      </div>
    </div>
  );
};

export default VendorProjectCard;
