import { FiDollarSign, FiClock, FiCheckCircle, FiTrendingUp } from "react-icons/fi";

const stats = [
  {
    id: "total_outstanding",
    label: "Total Outstanding",
    value: "$29,430",
    subtext: null,
    icon: FiDollarSign,
    bg: "bg-[#FCECE7]",
    iconColor: "text-[#C87A65]",
  },
  {
    id: "pending_review",
    label: "Pending Review",
    value: "$14,310",
    subtext: "3 invoices",
    icon: FiClock,
    bg: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]",
  },
  {
    id: "approved",
    label: "Approved",
    value: "$15,120",
    subtext: "2 invoices",
    icon: FiCheckCircle,
    bg: "bg-[#E3F2FD]",
    iconColor: "text-[#1565C0]",
  },
  {
    id: "paid",
    label: "Paid (This Month)",
    value: "$11,718",
    subtext: "3 invoices",
    icon: FiTrendingUp,
    bg: "bg-[#E8F5E9]",
    iconColor: "text-[#2E7D32]",
  },
];

const InvoiceStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.id}
            className="bg-white border border-[#E8E2DE] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
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

            {/* Subtext */}
            {stat.subtext && (
              <span className="text-[10px] font-semibold text-[#817B77] bg-[#FAF7F5] border border-[#F2EBE5] px-2 py-1 rounded-lg shrink-0">
                {stat.subtext}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InvoiceStats;
