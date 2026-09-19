import { FiMessageSquare, FiAlertCircle, FiClock, FiCheckCircle } from "react-icons/fi";

const SupportStats = ({ statsData = {} }) => {
  const {
    totalTickets = 0,
    open = 0,
    inProgress = 0,
    resolved = 0,
  } = statsData;

  const cardItems = [
    {
      id: "total",
      label: "Total Tickets",
      value: String(totalTickets),
      icon: FiMessageSquare,
      bg: "bg-[#F2EBE5]",
      iconColor: "text-[#817B77]",
    },
    {
      id: "open",
      label: "Open",
      value: String(open),
      icon: FiAlertCircle,
      bg: "bg-[#E3F2FD]",
      iconColor: "text-[#1565C0]",
    },
    {
      id: "in_progress",
      label: "In Progress",
      value: String(inProgress),
      icon: FiClock,
      bg: "bg-[#FEF3C7]",
      iconColor: "text-[#D97706]",
    },
    {
      id: "resolved",
      label: "Resolved",
      value: String(resolved),
      icon: FiCheckCircle,
      bg: "bg-[#E8F5E9]",
      iconColor: "text-[#2E7D32]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cardItems.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.id}
            className="bg-white border border-[#E8E2DE] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-medium text-[#817B77]">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-[#3E3734] mt-1">
                {stat.value}
              </h3>
            </div>

            {/* Icon Container */}
            <div
              className={`w-10 h-10 rounded-full ${stat.bg} ${stat.iconColor} flex items-center justify-center shrink-0 border border-black/5`}
            >
              <Icon className="text-lg" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SupportStats;
