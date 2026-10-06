import { FiSearch, FiHelpCircle, FiCpu } from "react-icons/fi";
import NotificationPopover from "../common/NotificationPopover";

const SuperAdminHeader = ({ searchQuery = "", setSearchQuery = () => {} }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#EBE6E3] px-6 py-3 flex items-center justify-between gap-4 shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1 max-w-xl">
        <FiSearch
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77]"
          size={16}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search organizations, metrics, or logs..."
          className="w-full h-9 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg pl-10 pr-4 text-xs text-[#2D3436] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#5141F5] focus:bg-white"
        />
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Popover */}
        <NotificationPopover
          buttonClassName="relative p-2 rounded-full bg-white border border-[#EBE6E3] text-[#6E6763] hover:text-[#2D3436] hover:bg-[#F5F2F0] transition-colors cursor-pointer"
          iconClassName="text-sm"
          align="right"
        />

        {/* Help Button */}
        <button
          type="button"
          className="p-2 rounded-full bg-white border border-[#EBE6E3] text-[#6E6763] hover:text-[#2D3436] hover:bg-[#F5F2F0] transition-colors cursor-pointer"
          title="Help & Support"
          aria-label="Help & Support"
        >
          <FiHelpCircle className="text-sm" />
        </button>

        {/* Deploy Update Button (Disabled as per Step 3 requirement) */}
        <button
          type="button"
          disabled
          title="Deploy Update action is unavailable"
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#817B77]/20 text-[#817B77] text-xs font-semibold cursor-not-allowed opacity-75 border border-[#817B77]/30"
        >
          <FiCpu className="text-xs" />
          <span>Deploy Update</span>
        </button>
      </div>
    </header>
  );
};

export default SuperAdminHeader;
