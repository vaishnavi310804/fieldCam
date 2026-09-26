import { FiAward, FiCheckCircle } from "react-icons/fi";

const MilestonesSummary = ({ summary = {} }) => {
  const completed = summary?.completed || 0;

  const milestones = [
    { target: 10, label: "10 Projects Completed", achieved: completed >= 10 },
    { target: 50, label: "50 Projects Completed", achieved: completed >= 50 },
    { target: 100, label: "100 Projects Completed", achieved: completed >= 100 },
    { target: 250, label: "250 Projects Completed", achieved: completed >= 250 },
  ];

  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <FiAward className="text-[#8B5CF6] text-base" />
        <h3 className="text-sm font-bold text-[#2D3436]">Vendor Milestones</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {milestones.map((m, idx) => (
          <div
            key={idx}
            className={`border rounded-xl p-3.5 flex items-center justify-between transition-all ${
              m.achieved
                ? "bg-[#10B981]/5 border-[#10B981]/20 text-[#10B981]"
                : "bg-[#FAF7F5] border-[#EBE6E3] text-[#817B77]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FiCheckCircle
                className={m.achieved ? "text-[#10B981]" : "text-[#A09893]"}
              />
              <span className="text-xs font-bold text-[#2D3436]">{m.label}</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                m.achieved
                  ? "bg-[#10B981] text-white"
                  : "bg-white text-[#817B77] border border-[#EBE6E3]"
              }`}
            >
              {m.achieved ? "Achieved" : `${completed}/${m.target}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestonesSummary;
