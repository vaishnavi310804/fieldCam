import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { FiTrendingUp } from "react-icons/fi";

const revenueData = [
  { month: "Jul", revenue: 42000 },
  { month: "Aug", revenue: 48000 },
  { month: "Sep", revenue: 52000 },
  { month: "Oct", revenue: 59000 },
  { month: "Nov", revenue: 54000 },
  { month: "Dec", revenue: 64000 },
  { month: "Jan", revenue: 62000 },
  { month: "Feb", revenue: 70000 },
  { month: "Mar", revenue: 52000 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#3E3734] text-white text-[11px] rounded-lg py-1.5 px-3 shadow-lg font-medium border border-[#524B48]">
        <p className="font-bold border-b border-gray-600 pb-1 mb-1">{label}</p>
        <p className="text-[#5B67CA]">
          Revenue: ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const RevenueAnalyticsChart = () => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      {/* Header & YoY Badge */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#3E3734]">Revenue Analytics</h2>
          <p className="text-xs text-[#817B77] mt-0.5">Monthly revenue trend</p>
        </div>

        {/* YoY Badge */}
        <div className="flex items-center gap-1 bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-1 rounded-full text-xs font-semibold">
          <FiTrendingUp className="text-xs" />
          <span>+18% YoY</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={revenueData}
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
              domain={[0, 80000]}
              ticks={[0, 20000, 40000, 60000, 80000]}
              tickFormatter={(val) => `$${val / 1000}k`}
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
      </div>
    </div>
  );
};

export default RevenueAnalyticsChart;
