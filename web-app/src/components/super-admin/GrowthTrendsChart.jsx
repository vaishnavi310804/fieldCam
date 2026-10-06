import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { FiChevronDown } from "react-icons/fi";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#2D3436] text-white text-[11px] rounded-lg py-2 px-3 shadow-xl font-medium border border-[#4A5568]">
        <p className="font-bold border-b border-gray-600 pb-1 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="flex items-center justify-between gap-3">
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const GrowthTrendsChart = ({ data = [], loading = false }) => {
  const [range, setRange] = useState("Last 30 Days");

  const hasData =
    Array.isArray(data) &&
    data.some((d) => (d.userAcquisition || 0) > 0 || (d.platformActivity || 0) > 0);

  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-[#2D3436]">Growth Trends</h2>
          <p className="text-xs text-[#817B77] mt-0.5">
            Comparison of user acquisition vs platform activity
          </p>
        </div>

        {/* Range Selector */}
        <div className="relative inline-block">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="appearance-none bg-[#F8F7FF] border border-[#E5E7EB] text-[#2D3436] text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer hover:bg-[#F2EBE5] transition"
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
          </select>
          <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#817B77] pointer-events-none text-xs" />
        </div>
      </div>

      {/* Chart Body */}
      {loading ? (
        <div className="w-full flex-1 min-h-[240px] flex items-center justify-center text-xs text-[#817B77]">
          Loading platform growth trends...
        </div>
      ) : !hasData ? (
        <div className="w-full flex-1 min-h-[240px] bg-[#FAF7F5] rounded-xl border border-dashed border-[#EBE6E3] flex flex-col items-center justify-center p-6 text-center">
          <p className="text-xs font-bold text-[#2D3436]">No historical growth data recorded yet.</p>
        </div>
      ) : (
        <div className="w-full flex-1 min-h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EBE5" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#817B77", fontSize: 10, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#817B77", fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="userAcquisition"
                name="User Acquisition"
                fill="#E2DCD8"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="platformActivity"
                name="Platform Activity"
                fill="#817B77"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default GrowthTrendsChart;
