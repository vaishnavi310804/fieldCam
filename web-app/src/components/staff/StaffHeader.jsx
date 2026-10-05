import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { FiSearch, FiCalendar } from "react-icons/fi";
import NotificationPopover from "../common/NotificationPopover";

const StaffHeader = ({
  title = "Staff Dashboard",
  searchTerm = "",
  setSearchTerm = () => {},
  showSearch = true,
}) => {
  const { user } = useAuth();

  const displayName =
    user?.name || user?.email?.split("@")[0] || "Staff Member";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="h-16 bg-[#EEE9E6] border-b border-[#E8E2DE] px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-base font-bold text-[#3E3734] leading-tight">
          {title}
        </h1>
        <p className="text-[11px] text-[#817B77]">
          Welcome back,{" "}
          <span className="font-semibold text-[#3E3734]">{displayName}</span>. Here's your operational overview.
        </p>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        {showSearch && (
          <div className="relative hidden sm:block w-48 lg:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#817B77]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
            />
          </div>
        )}

        {/* Date Display Pill */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#FAF7F5] border border-[#E8E2DE] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#4A423F]">
          <FiCalendar className="text-xs text-[#817B77]" />
          <span>{formattedDate}</span>
        </div>

        {/* Notification Bell Icon */}
        <NotificationPopover
          buttonClassName="relative text-[#817B77] hover:text-[#3E3734] p-2 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] hover:bg-[#EAE4DF] transition-colors cursor-pointer"
          iconClassName="text-sm"
        />

        {/* Staff User Avatar Circle */}
        <Link
          to="/staff/profile"
          className="w-8 h-8 rounded-full bg-[#5141F5] text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
          title={`View Profile (${displayName})`}
        >
          {initials}
        </Link>
      </div>
    </header>
  );
};

export default StaffHeader;
