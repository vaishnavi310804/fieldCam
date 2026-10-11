import { FiSearch } from "react-icons/fi";

const StaffToolbar = ({
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  counts,
}) => {
  const filterTabs = [
    { id: "All", label: "All", count: counts.all || 0 },
    { id: "ACTIVE", label: "Active", count: counts.active || 0, dotColor: "bg-[#10B981]" },
    { id: "INACTIVE", label: "Inactive", count: counts.inactive || 0, dotColor: "bg-[#9CA3AF]" },
  ];

  return (
    <div className="space-y-3">
      {/* 1. Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#817B77]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, role, location, or ID..."
          className="w-full bg-white border border-[#E8E2DE] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors shadow-2xs"
        />
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                isActive
                  ? "bg-[#3E3734] text-white ring-2 ring-[#3E3734]/20"
                  : "bg-white text-[#817B77] border border-[#E8E2DE] hover:bg-[#FAF7F5] hover:text-[#3E3734]"
              }`}
            >
              {tab.dotColor && (
                <span className={`w-2 h-2 rounded-full ${tab.dotColor}`} />
              )}
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-[#FAF7F5] text-[#817B77]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StaffToolbar;
