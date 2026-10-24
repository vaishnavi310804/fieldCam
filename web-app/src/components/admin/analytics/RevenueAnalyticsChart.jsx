import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#3E3734] text-white text-[11px] rounded-lg py-1.5 px-3 shadow-lg font-medium border border-[#524B48]">
        <p className="font-bold border-b border-gray-600 pb-1 mb-1">{label}</p>
        <p className="text-[#5B67CA]">
          Revenue: ${Number(payload[0].value || 0).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const RevenueAnalyticsChart = ({ data = null, loading = false }) => {
  const chartData = Array.isArray(data?.series) ? data.series : [];
  const trend = data?.trend;

  const maxRevenue = chartData.reduce(
    (max, d) => Math.max(max, Number(d.revenue || 0)),
    0
  );
  const yDomainMax = Math.max(1000, Math.ceil(maxRevenue * 1.25));

  const showPositiveTrend =
    !loading &&
    trend?.badge &&
    trend.badge !== "N/A" &&
    !trend?.isNeutral &&
    trend?.isPositive === true;

  const showNegativeTrend =
    !loading &&
    trend?.badge &&
    trend.badge !== "N/A" &&
    !trend?.isNeutral &&
    trend?.isPositive === false;

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      {/* Header & Trend Badge */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#3E3734]">Revenue Analytics</h2>
          <p className="text-xs text-[#817B77] mt-0.5">Monthly revenue trend (Paid invoices)</p>
        </div>

        {/* Dynamic Trend Badge */}
        {loading ? (
          <div className="bg-[#F2EBE5] text-[#817B77] px-2.5 py-1 rounded-full text-xs font-medium">
            ...
          </div>
        ) : showPositiveTrend ? (
          <div className="flex items-center gap-1 bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-1 rounded-full text-xs font-semibold">
            <FiTrendingUp className="text-xs" />
            <span>{trend.badge}</span>
          </div>
        ) : showNegativeTrend ? (
          <div className="flex items-center gap-1 bg-[#FFEBEE] text-[#C62828] px-2.5 py-1 rounded-full text-xs font-semibold">
            <FiTrendingDown className="text-xs" />
            <span>{trend.badge}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-[#F2EBE5] text-[#817B77] px-2.5 py-1 rounded-full text-xs font-medium">
            <span>{trend?.badge || "N/A"}</span>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="w-full flex-1 min-h-[220px] flex items-center justify-center">
        {loading ? (
          <p className="text-xs text-[#817B77]">Loading revenue analytics...</p>
        ) : chartData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs font-medium text-[#817B77]">
              No paid invoice revenue recorded for this period
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B67CA" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#5B67CA" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F2EBE5"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9E9792", fontSize: 10 }}
              />
              <YAxis
                domain={[0, yDomainMax]}
                tickFormatter={(val) => (val >= 1000 ? `$${Math.round(val / 1000)}k` : `$${val}`)}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9E9792", fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#5B67CA"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueAnalyticsChart;
