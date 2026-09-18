import { FiSearch } from "react-icons/fi";

const filterOptions = ["All", "Open", "In Progress", "Resolved", "Closed"];

const SupportToolbar = ({
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Search Bar */}
      <div className="relative flex-1 max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-sm" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tickets..."
          className="w-full bg-white border border-[#E8E2DE] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors shadow-sm"
        />
      </div>

      {/* Right: Filter Pills */}
      <div className="flex items-center gap-1 bg-white border border-[#E8E2DE] p-1 rounded-xl shadow-sm self-start sm:self-auto">
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
    </div>
  );
};

export default SupportToolbar;
