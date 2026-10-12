import {
  FiCheck,
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiUsers,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";

const ProjectSelectionCard = ({
  project,
  isSelected,
  isAlreadyAssigned,
  staffName,
  onToggle,
}) => {
  const isNew = (project.status || "").toUpperCase() === "NEW";
  const isInProgress = (project.status || "").toUpperCase() === "IN PROGRESS";
  const isAssigned = (project.status || "").toUpperCase() === "ASSIGNED";
  const hasOtherStaff = Boolean(project.assignedStaffId && !isAlreadyAssigned);

  const isSelectable = isAssigned && !project.assignedStaffId;

  const formattedDeadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleClick = () => {
    if (!isSelectable) return;
    onToggle(project._id || project.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-2xl border p-4 transition-all shadow-2xs select-none ${
        isAlreadyAssigned
          ? "border-[#E8E2DE] bg-[#FAF7F5] opacity-75 cursor-default"
          : !isSelectable
          ? "border-[#E8E2DE] bg-[#FAF7F5] opacity-75 cursor-not-allowed"
          : isSelected
          ? "border-[#C87A65] bg-[#FDF9F7] ring-1 ring-[#C87A65]/30 cursor-pointer"
          : "border-[#E8E2DE] hover:border-[#D9CFC9] cursor-pointer"
      }`}
    >
      {/* Top Row: Checkbox + Project Name + Priority */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
              isAlreadyAssigned
                ? "bg-[#10B981] text-white"
                : !isSelectable
                ? "border-2 border-[#D1C7C0] bg-[#F3F4F6] text-[#A39A94] cursor-not-allowed"
                : isSelected
                ? "bg-[#C87A65] text-white"
                : "border-2 border-[#D1C7C0] bg-white hover:border-[#C87A65]"
            }`}
          >
            {(isSelected || isAlreadyAssigned) && (
              <FiCheck size={13} strokeWidth={3} />
            )}
          </div>
          <h3 className="text-sm font-bold text-[#3E3734] truncate leading-tight">
            {project.projectName}
          </h3>
        </div>

        {project.priority && (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
              project.priority.toLowerCase() === "high"
                ? "bg-[#FEE2E2] text-[#DC2626]"
                : project.priority.toLowerCase() === "medium"
                ? "bg-[#FEF3C7] text-[#D97706]"
                : "bg-[#F3F4F6] text-[#4B5563]"
            }`}
          >
            {project.priority}
          </span>
        )}
      </div>

      {/* Row 2: Project Code Badge + Service Type */}
      <div className="flex items-center gap-2 mt-2 ml-7.5 flex-wrap">
        {project.projectId && (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#EEF2FF] text-[#4F46E5]">
            {project.projectId}
          </span>
        )}
        {project.projectId && project.serviceTypeName && (
          <span className="text-[#A39A94] text-xs">•</span>
        )}
        {project.serviceTypeName && (
          <span className="text-xs text-[#817B77] font-medium">
            {project.serviceTypeName}
          </span>
        )}
      </div>

      {/* Row 3: Location + Deadline + Status */}
      <div className="flex items-center gap-3.5 mt-2 ml-7.5 text-xs text-[#817B77] flex-wrap">
        {project.location && (
          <div className="flex items-center gap-1 truncate">
            <FiMapPin size={12} className="text-[#A39A94] shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>
        )}

        {formattedDeadline && (
          <div className="flex items-center gap-1 truncate">
            <FiCalendar size={12} className="text-[#A39A94] shrink-0" />
            <span className="truncate">{formattedDeadline}</span>
          </div>
        )}

        {project.status && (
          <div
            className={`flex items-center gap-1 font-semibold ${
              isAssigned
                ? "text-[#2563EB]"
                : isNew
                ? "text-[#3498DB]"
                : isInProgress
                ? "text-[#E67E22]"
                : "text-slate-600"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAssigned
                  ? "bg-[#2563EB]"
                  : isNew
                  ? "bg-[#3498DB]"
                  : isInProgress
                  ? "bg-[#E67E22]"
                  : "bg-slate-600"
              }`}
            />
            <span>
              {isAssigned
                ? "ASSIGNED"
                : isNew
                ? "New"
                : project.status}
            </span>
          </div>
        )}
      </div>

      {/* Row 4: Staff assignment info / Eligibility message */}
      <div className="mt-2 ml-7.5 text-[11px]">
        {isAlreadyAssigned ? (
          <div className="flex items-center gap-1 text-[#059669] font-medium">
            <FiCheckCircle size={12} />
            <span>Already assigned to {staffName}</span>
          </div>
        ) : hasOtherStaff || isInProgress ? (
          <div className="flex items-center gap-1 text-[#817B77]">
            <FiUsers size={12} className="text-[#A39A94]" />
            <span>Currently assigned to {project.assignedStaffName || "staff member"}</span>
          </div>
        ) : isNew ? (
          <div className="flex items-center gap-1 text-[#D97706]">
            <FiAlertCircle size={12} />
            <span>Requires vendor acceptance before assigning staff</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[#A39A94]">
            <FiClock size={12} />
            <span>Unassigned • Ready for assignment</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSelectionCard;
