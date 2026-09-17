import { FiTrendingUp, FiTrendingDown, FiEye, FiCheckCircle } from "react-icons/fi";

const statData = [
  {
    id: "new-projects",
    title: "New Projects",
    value: "24",
    change: "+12%",
    timeframe: "vs last month",
    isPositive: true,
  },
  {
    id: "in-progress",
    title: "In Progress",
    value: "18",
    change: "+5%",
    timeframe: "vs last month",
    isPositive: true,
  },
  {
    id: "under-review",
    title: "Under Review",
    value: "7",
    change: "-3%",
    timeframe: "vs last month",
    isPositive: false,
    icon: FiEye,
  },
  {
    id: "completed",
    title: "Completed",
    value: "142",
    change: "+22%",
    timeframe: "vs last month",
    isPositive: true,
    icon: FiCheckCircle,
  },
];

const StatCard = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {statData.map((card) => {
        const IconComponent = card.icon;

        return (
          <div
            key={card.id}
            className="bg-white border border-[#E8E2DE] rounded-2xl p-5 relative overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[155px]"
          >
            {/* Soft decorative background circle top right */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#FAF7F5] rounded-full pointer-events-none border border-[#F2EBE5]"></div>

            {/* Top row: Title and optional icon badge */}
            <div className="flex items-center justify-between z-10">
              <span className="text-xs font-semibold text-[#817B77]">
                {card.title}
              </span>

              {IconComponent && (
                <div className="w-7 h-7 rounded-full bg-[#F4EFEA] border border-[#E8E2DE] flex items-center justify-center text-[#6E6763] z-10">
                  <IconComponent className="text-xs" />
                </div>
              )}
            </div>

            {/* Main Value */}
            <div className="z-10 my-1">
              <span className="text-3xl font-extrabold text-[#3E3734] tracking-tight">
                {card.value}
              </span>
            </div>

            {/* Trend Indicator */}
            <div className="flex items-center gap-1.5 text-[11px] z-10">
              {card.isPositive ? (
                <div className="flex items-center gap-1 text-[#2E7D32] font-semibold">
                  <FiTrendingUp className="text-xs" />
                  <span>{card.change}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[#C62828] font-semibold">
                  <FiTrendingDown className="text-xs" />
                  <span>{card.change}</span>
                </div>
              )}
              <span className="text-[#9E9792]">{card.timeframe}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCard;
