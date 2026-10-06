import { FiTrendingUp, FiTrendingDown, FiMinus, FiAlertCircle } from "react-icons/fi";

const SuperAdminMetricCard = ({
  title,
  value,
  change,
  isAvailable = true,
  reason,
  icon: Icon,
  iconBg = "bg-blue-50 text-blue-600",
}) => {
  const isPositive = change && change.startsWith("+");
  const isNegative = change && change.startsWith("-");

  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Metric Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
        >
          {Icon && <Icon className="text-lg" />}
        </div>

        {/* Change Badge */}
        {isAvailable && change ? (
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isPositive
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : isNegative
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : "bg-slate-50 text-slate-500 border border-slate-200"
            }`}
          >
            {isPositive ? (
              <FiTrendingUp className="text-xs" />
            ) : isNegative ? (
              <FiTrendingDown className="text-xs" />
            ) : (
              <FiMinus className="text-xs" />
            )}
            <span>{change}</span>
          </div>
        ) : (
          <span className="text-[10px] font-semibold text-[#817B77] bg-[#F5F2F0] px-2 py-0.5 rounded-full border border-[#EBE6E3]">
            {isAvailable ? "— Stable" : "N/A"}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-[#817B77] mb-1">{title}</p>
        <div className="flex items-baseline justify-between">
          <h3 className="text-2xl font-bold text-[#2D3436] tracking-tight">
            {isAvailable ? value : "N/A"}
          </h3>
        </div>

        {!isAvailable && reason && (
          <p className="text-[10px] text-[#A39A94] mt-1.5 flex items-center gap-1">
            <FiAlertCircle className="text-amber-500 shrink-0" />
            <span className="truncate">{reason}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default SuperAdminMetricCard;
