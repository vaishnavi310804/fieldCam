import { FiUsers, FiUserCheck, FiBriefcase, FiTrendingUp } from "react-icons/fi";

const StaffStats = ({ stats }) => {
  const {
    totalStaff = 0,
    activeNow = 0,
    activeProjects = 0,
    avgRating = "N/A",
  } = stats || {};

  const cards = [
    {
      id: "total",
      label: "TOTAL STAFF",
      value: totalStaff,
      icon: FiUsers,
      iconColor: "text-[#3B82F6]",
      iconBg: "bg-[#EFF6FF]",
    },
    {
      id: "activeNow",
      label: "ACTIVE NOW",
      value: activeNow,
      icon: FiUserCheck,
      iconColor: "text-[#10B981]",
      iconBg: "bg-[#ECFDF5]",
    },
    {
      id: "activeProjects",
      label: "ACTIVE PROJECTS",
      value: activeProjects,
      icon: FiBriefcase,
      iconColor: "text-[#F59E0B]",
      iconBg: "bg-[#FFFBEB]",
    },
    {
      id: "avgRating",
      label: "AVG RATING",
      value: avgRating,
      icon: FiTrendingUp,
      iconColor: "text-[#14B8A6]",
      iconBg: "bg-[#F0FDFA]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white border border-[#E8E2DE] rounded-2xl p-4 flex items-center gap-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-[#D9CFC9]"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}
            >
              <Icon className={`text-xl ${card.iconColor}`} />
            </div>
            <div className="min-w-0">
              <span className="block text-2xl font-bold text-[#3E3734] leading-tight tracking-tight">
                {card.value}
              </span>
              <span className="block text-[10px] font-bold text-[#817B77] uppercase tracking-wider mt-0.5 truncate">
                {card.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StaffStats;
