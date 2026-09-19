import { FiSliders } from "react-icons/fi";

const ProjectFilters = ({ activeFilter, setActiveFilter, allProjects = [] }) => {
  const filterTabs = [
    { id: "All", label: "All", count: allProjects.length },
    {
      id: "New",
      label: "New",
      count: allProjects.filter((p) => p.status === "New").length,
    },
    {
      id: "In Progress",
      label: "In Progress",
      count: allProjects.filter((p) => p.status === "In Progress").length,
    },
    {
      id: "Submitted",
      label: "Submitted",
      count: allProjects.filter((p) => p.status === "Submitted").length,
    },
    {
      id: "Approved",
      label: "Approved",
      count: allProjects.filter((p) => p.status === "Approved").length,
    },
    {
      id: "Rejected",
      label: "Rejected",
      count: allProjects.filter((p) => p.status === "Rejected").length,
    },
  ];

  const pendingApprovalsCount = allProjects.filter(
    (p) => p.status === "Submitted"
  ).length;

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
          onClick={() => setActiveFilter("Submitted")}
          className="relative flex items-center gap-1.5 bg-[#8A817C] hover:bg-[#7A726D] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
        >
          <span>Approval Requests</span>
          {pendingApprovalsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C62828] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#EEE9E6]">
              {pendingApprovalsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProjectFilters;
