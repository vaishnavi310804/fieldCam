import { FiSliders } from "react-icons/fi";

const filterTabs = [
  { id: "All", label: "All", count: 12 },
  { id: "New", label: "New", count: 3 },
  { id: "In Progress", label: "In Progress", count: 4 },
  { id: "Submitted", label: "Submitted", count: 2 },
  { id: "Approved", label: "Approved", count: 2 },
];

const ProjectFilters = ({ activeFilter, setActiveFilter }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
      {/* Left Filter Status Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#C8B5AC] text-[#3E3734] shadow-xs"
                  : "bg-[#F4EFEA] text-[#817B77] hover:bg-[#EAE4DF] hover:text-[#4A423F]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? "bg-[#3E3734]/10 text-[#3E3734]"
                    : "bg-[#EAE4DF] text-[#817B77]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Filter Controls */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {/* More Filters Button */}
        <button
          type="button"
          className="flex items-center gap-1.5 bg-white border border-[#E8E2DE] hover:bg-[#F7F4F2] text-[#4A423F] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
        >
          <FiSliders className="text-sm text-[#817B77]" />
          <span>More Filters</span>
        </button>

        {/* Approval Requests Button with Red Badge */}
        <button
          type="button"
          className="relative flex items-center gap-1.5 bg-[#8A817C] hover:bg-[#7A726D] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
        >
          <span>Approval Requests</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C62828] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#EEE9E6]">
            5
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProjectFilters;
