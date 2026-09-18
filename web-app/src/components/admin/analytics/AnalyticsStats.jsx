import { FiUsers, FiUserCheck, FiClock, FiAward, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const stats = [
  {
    id: "total_vendors",
    label: "Total Vendors",
    value: "8",
    change: "+2 vs last month",
    isPositive: true,
    icon: FiUsers,
    circleBg: "bg-[#F2EBE5]",
    iconColor: "text-[#817B77]",
  },
  {
    id: "active_vendors",
    label: "Active Vendors",
    value: "6",
    change: "+1 vs last month",
    isPositive: true,
    icon: FiUserCheck,
    circleBg: "bg-[#E8F5E9]",
    iconColor: "text-[#2E7D32]",
  },
  {
    id: "avg_completion_time",
    label: "Avg. Completion Time",
    value: "4.2d",
    change: "-0.3d vs last month",
    isPositive: true,
    icon: FiClock,
    circleBg: "bg-[#FCECE7]",
    iconColor: "text-[#C87A65]",
  },
  {
    id: "avg_approval_score",
    label: "Avg. Approval Score",
    value: "87%",
    change: "+3% vs last month",
    isPositive: true,
    icon: FiAward,
    circleBg: "bg-[#E3F2FD]",
    iconColor: "text-[#1565C0]",
  },
];

const AnalyticsStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.id}
            className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full"
          >
            {/* Top row: Label & Circle Icon */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#817B77]">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-[#3E3734] mt-1">
                  {stat.value}
                </h3>
              </div>

              {/* Circle Icon Container */}
              <div
                className={`w-10 h-10 rounded-full ${stat.circleBg} ${stat.iconColor} flex items-center justify-center shrink-0 border border-black/5`}
              >
                <Icon className="text-lg" />
              </div>
            </div>

            {/* Bottom row: Change Indicator */}
            <div className="flex items-center gap-1 text-xs font-semibold text-[#2E7D32] mt-4">
              {stat.isPositive ? (
                <FiTrendingUp className="text-xs" />
              ) : (
                <FiTrendingDown className="text-xs" />
              )}
              <span>{stat.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsStats;
