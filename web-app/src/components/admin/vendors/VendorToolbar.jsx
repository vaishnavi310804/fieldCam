import { FiSearch, FiPlus, FiUserCheck } from "react-icons/fi";
import { usePermissions } from "../../../hooks/usePermissions";

const filterOptions = ["All", "Active", "Suspended", "Inactive"];

const VendorToolbar = ({
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  readOnly = false,
  onAddVendor,
  onApproveVendor,
}) => {
  const { can } = usePermissions();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Search Bar */}
      <div className="relative flex-1 max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-sm" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search vendors..."
          className="w-full bg-white border border-[#E8E2DE] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors shadow-sm"
        />
      </div>

      {/* Right: Filters & Add Vendor Button */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white border border-[#E8E2DE] p-1 rounded-xl shadow-sm">
          {filterOptions.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#8A817C] text-white shadow-sm"
                    : "text-[#817B77] hover:bg-[#F7F4F2] hover:text-[#3E3734]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Approve Vendor & Add Vendor Buttons */}
        {!readOnly && (
          <div className="flex items-center gap-2">
            {can("VENDORS", "REGISTRATIONS_REVIEW") && (
              <button
                type="button"
                onClick={onApproveVendor}
                className="bg-white hover:bg-[#F7F4F2] text-[#3E3734] border border-[#E8E2DE] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0 cursor-pointer"
              >
                <FiUserCheck className="text-sm text-[#8A817C]" />
                <span>Approve Vendor</span>
              </button>
            )}

            {can("VENDORS", "CREATE") && (
              <button
                onClick={onAddVendor}
                className="bg-[#8A817C] hover:bg-[#6E6763] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0 cursor-pointer"
              >
                <FiPlus className="text-sm" />
                <span>Add Vendor</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorToolbar;
