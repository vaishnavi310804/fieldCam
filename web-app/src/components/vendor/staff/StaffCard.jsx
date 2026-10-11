import { useState, useRef, useEffect } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiMoreVertical,
  FiStar,
  FiEdit2,
  FiCheckCircle,
  FiSlash,
  FiPlus,
} from "react-icons/fi";

const formatRelativeTime = (dateInput) => {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "Just now";

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return "Online now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours === 1) return "1 hr ago";
  if (diffHours < 24) return `${diffHours} hrs ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const StaffCard = ({
  staff,
  onAssignProject,
  onEditStaff,
  onToggleStatus,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!staff) return null;

  const name = staff.name || "Staff Member";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || "ST";

  const roleTitle = staff.title || staff.department || "Field Staff";
  const statusUpper = (staff.status || "ACTIVE").toUpperCase();
  const isActive = statusUpper === "ACTIVE";

  const activeProjectsCount = staff.activeProjects !== undefined ? staff.activeProjects : 0;
  const completedProjectsCount = staff.completedProjects !== undefined ? staff.completedProjects : 0;
  const hasRating = staff.rating !== undefined && staff.rating !== null;
  const ratingValue = hasRating ? Number(staff.rating).toFixed(1) : "N/A";

  const lastActiveText = staff.isOnline
    ? "Online now"
    : formatRelativeTime(staff.lastSeenAt) ||
      (staff.createdAt
        ? `Joined ${new Date(staff.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}`
        : "—");

  const skillsList = Array.isArray(staff.skills) ? staff.skills : [];

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full transition-all hover:border-[#D9CFC9]">
      <div className="space-y-4">
        {/* 1. Header: Avatar + Name + Title + Status + 3-dots */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar with Status Dot */}
            <div className="relative shrink-0">
              {staff.profileImage ? (
                <img
                  src={staff.profileImage}
                  alt={name}
                  className="w-12 h-12 rounded-full object-cover border border-[#E8E2DE]"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs"
                  style={{
                    backgroundColor: staff.avatarBg || "#7D6B63",
                  }}
                >
                  {initials}
                </div>
              )}
              {/* Presence Indicator Dot */}
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  isActive ? "bg-[#10B981]" : "bg-[#9CA3AF]"
                }`}
                title={isActive ? "Active Account" : "Inactive Account"}
              />
            </div>

            {/* Name & Role */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-[#3E3734] truncate leading-tight">
                  {name}
                </h3>
                {hasRating && Number(staff.rating) >= 4.5 && (
                  <FiStar
                    className="text-xs text-[#F59E0B] fill-[#F59E0B] shrink-0"
                    title={`Rating: ${ratingValue}`}
                  />
                )}
              </div>
              <p className="text-xs text-[#817B77] truncate mt-0.5">
                {roleTitle}
              </p>
            </div>
          </div>

          {/* Right Header: Status Pill & Dropdown Menu */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isActive
                  ? "bg-[#ECFDF5] text-[#065F46] border border-[#D1FAE5]"
                  : "bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? "bg-[#10B981]" : "bg-[#9CA3AF]"
                }`}
              />
              <span>{isActive ? "Active" : "Inactive"}</span>
            </span>

            {/* 3-dots Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#817B77] hover:bg-[#FAF7F5] hover:text-[#3E3734] transition-colors cursor-pointer"
                title="Staff actions"
              >
                <FiMoreVertical size={14} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 z-30 w-36 bg-white border border-[#E8E2DE] rounded-xl shadow-lg p-1 text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (onEditStaff) onEditStaff(staff);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#3E3734] hover:bg-[#FAF7F5] font-semibold text-left transition-colors cursor-pointer"
                  >
                    <FiEdit2 size={12} className="text-[#817B77]" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (onToggleStatus) {
                        onToggleStatus(staff, isActive ? "INACTIVE" : "ACTIVE");
                      }
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-semibold text-left transition-colors cursor-pointer ${
                      isActive
                        ? "text-[#C62828] hover:bg-[#FFEBEE]"
                        : "text-[#2E7D32] hover:bg-[#E8F5E9]"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <FiSlash size={12} />
                        <span>Deactivate</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle size={12} />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. 3-Metrics Strip (ACTIVE, DONE, RATING) */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl py-2 px-1">
            <span className="block text-sm font-bold text-[#1E40AF]">
              {activeProjectsCount}
            </span>
            <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">
              ACTIVE
            </span>
          </div>

          <div className="bg-[#ECFDF5] border border-[#D1FAE5] rounded-xl py-2 px-1">
            <span className="block text-sm font-bold text-[#065F46]">
              {completedProjectsCount}
            </span>
            <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">
              DONE
            </span>
          </div>

          <div className="bg-[#FEFCE8] border border-[#FEF08A] rounded-xl py-2 px-1">
            <span className="block text-sm font-bold text-[#92400E]">
              {ratingValue}
            </span>
            <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">
              RATING
            </span>
          </div>
        </div>

        {/* 3. Contact Details & Location */}
        <div className="space-y-1.5 text-xs text-[#817B77] pt-1">
          <div className="flex items-center gap-2 truncate">
            <FiMail className="text-[12px] text-[#A39A94] shrink-0" />
            <a
              href={`mailto:${staff.email}`}
              className="truncate hover:text-[#3E3734] transition-colors"
            >
              {staff.email}
            </a>
          </div>

          <div className="flex items-center gap-2 truncate">
            <FiPhone className="text-[12px] text-[#A39A94] shrink-0" />
            <span className="truncate">{staff.phone || "—"}</span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <FiMapPin className="text-[12px] text-[#A39A94] shrink-0" />
            <span className="truncate">{staff.location || "—"}</span>
          </div>
        </div>

        {/* 4. Skills / Department Tags (if present) */}
        {(skillsList.length > 0 || staff.department) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skillsList.map((skill, idx) => (
              <span
                key={idx}
                className="bg-[#FAF7F5] border border-[#E8E2DE] text-[#817B77] px-2 py-0.5 rounded-md text-[10px] font-medium"
              >
                {skill}
              </span>
            ))}
            {skillsList.length === 0 && staff.department && (
              <span className="bg-[#FAF7F5] border border-[#E8E2DE] text-[#817B77] px-2 py-0.5 rounded-md text-[10px] font-medium">
                {staff.department}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 5. Card Bottom Footer: Last Active + Action Buttons */}
      <div className="pt-4 mt-3 border-t border-[#F2EBE5] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[#817B77] min-w-0">
          <FiClock className="text-[11px] text-[#A39A94] shrink-0" />
          <span className="truncate">{lastActiveText}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onAssignProject && onAssignProject(staff)}
            className="px-3.5 py-1.5 rounded-xl bg-[#E8DCD5] hover:bg-[#DBCDC5] text-[#3E3734] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FiPlus size={12} />
            <span>Assign</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onToggleStatus &&
              onToggleStatus(staff, isActive ? "INACTIVE" : "ACTIVE")
            }
            className={`px-3 py-1.5 rounded-xl border border-[#E8E2DE] bg-white text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
              isActive
                ? "text-[#817B77] hover:text-[#C62828] hover:bg-[#FFEBEE]/40"
                : "text-[#817B77] hover:text-[#2E7D32] hover:bg-[#E8F5E9]/40"
            }`}
          >
            {isActive ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffCard;
