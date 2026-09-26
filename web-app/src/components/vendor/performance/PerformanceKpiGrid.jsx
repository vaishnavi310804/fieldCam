import { FiCheckCircle, FiXCircle, FiPercent, FiClock } from "react-icons/fi";

const PerformanceKpiGrid = ({ summary, loading }) => {
  const completed = summary?.completed || 0;
  const rejected = summary?.rejected || 0;
  const approvalRate = summary?.approvalRate !== null && summary?.approvalRate !== undefined
    ? `${summary.approvalRate}%`
    : "-";
  const avgTime = summary?.avgTurnaroundDays !== null && summary?.avgTurnaroundDays !== undefined
    ? `${summary.avgTurnaroundDays}d`
    : "-";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Projects Completed */}
      <div className="bg-white rounded-2xl border border-[#EBE6E3] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-bold">
            <FiCheckCircle size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-[#2D3436] tracking-tight">
            {loading ? "..." : completed}
          </div>
          <p className="text-xs font-bold text-[#817B77] mt-0.5">Projects Completed</p>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#10B981]/5 pointer-events-none" />
      </div>

      {/* Card 2: Projects Rejected */}
      <div className="bg-white rounded-2xl border border-[#EBE6E3] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center font-bold">
            <FiXCircle size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-[#2D3436] tracking-tight">
            {loading ? "..." : rejected}
          </div>
          <p className="text-xs font-bold text-[#817B77] mt-0.5">Projects Rejected</p>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#EF4444]/5 pointer-events-none" />
      </div>

      {/* Card 3: Approval Rate */}
      <div className="bg-white rounded-2xl border border-[#EBE6E3] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center font-bold">
            <FiPercent size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-[#2D3436] tracking-tight">
            {loading ? "..." : approvalRate}
          </div>
          <p className="text-xs font-bold text-[#817B77] mt-0.5">Approval Rate</p>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#8B5CF6]/5 pointer-events-none" />
      </div>

      {/* Card 4: Avg. Completion Time */}
      <div className="bg-white rounded-2xl border border-[#EBE6E3] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center font-bold">
            <FiClock size={18} />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-[#2D3436] tracking-tight">
            {loading ? "..." : avgTime}
          </div>
          <p className="text-xs font-bold text-[#817B77] mt-0.5">Avg. Completion Time</p>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#06B6D4]/5 pointer-events-none" />
      </div>
    </div>
  );
};

export default PerformanceKpiGrid;
