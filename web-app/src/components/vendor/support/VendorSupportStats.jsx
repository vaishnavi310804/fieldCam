import React from "react";
import {
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";

const VendorSupportStats = ({ stats, loading }) => {
  const statItems = [
    {
      id: "open",
      label: "OPEN TICKETS",
      value: stats?.open ?? 0,
      icon: FiClock,
      iconBg: "bg-[#E3F2FD] text-[#1565C0]",
    },
    {
      id: "inProgress",
      label: "IN PROGRESS",
      value: stats?.inProgress ?? 0,
      icon: FiRefreshCw,
      iconBg: "bg-[#FFF3E0] text-[#E65100]",
    },
    {
      id: "resolved",
      label: "RESOLVED",
      value: stats?.resolved ?? 0,
      icon: FiCheckCircle,
      iconBg: "bg-[#E8F5E9] text-[#2E7D32]",
    },
    {
      id: "avgResponse",
      label: "AVG. RESPONSE",
      value: stats?.avgResponse ?? "N/A",
      icon: FiClock,
      iconBg: "bg-[#F3E5F5] text-[#6A1B9A]",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-[#E8E2DE] p-3.5 shadow-2xs flex items-center gap-3 h-16 sm:h-18"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${item.iconBg}`}
            >
              <Icon />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-bold text-[#3E3734] leading-tight truncate">
                {loading ? "..." : item.value}
              </div>
              <p className="text-[9px] font-bold text-[#817B77] uppercase tracking-wider truncate">
                {item.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VendorSupportStats;
