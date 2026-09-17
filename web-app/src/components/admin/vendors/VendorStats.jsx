import { FiBriefcase, FiCheckCircle, FiTrendingUp, FiCheckSquare } from "react-icons/fi";

const stats = [
  {
    id: "total",
    label: "Total Vendors",
    value: "8",
    icon: FiBriefcase,
    bg: "bg-[#F2EBE5]",
    iconColor: "text-[#817B77]",
  },
  {
    id: "active",
    label: "Active Vendors",
    value: "6",
    icon: FiCheckCircle,
    bg: "bg-[#E8F5E9]",
    iconColor: "text-[#2E7D32]",
  },
  {
    id: "approval",
    label: "Avg. Approval Rate",
    value: "81%",
    icon: FiTrendingUp,
    bg: "bg-[#FCECE7]",
    iconColor: "text-[#C87A65]",
  },
  {
    id: "completed",
    label: "Total Completed",
    value: "314",
    icon: FiCheckSquare,
    bg: "bg-[#E3F2FD]",
    iconColor: "text-[#1565C0]",
  },
];

const VendorStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.id}
            className="bg-white border border-[#E8E2DE] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-3.5"
          >
            {/* Icon Container */}
            <div
              className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.iconColor} flex items-center justify-center shrink-0 border border-black/5`}
            >
              <Icon className="text-lg" />
            </div>

            {/* Label & Value */}
            <div>
              <p className="text-[11px] font-medium text-[#817B77]">
                {stat.label}
              </p>
              <h3 className="text-xl font-bold text-[#3E3734] mt-0.5">
                {stat.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VendorStats;
