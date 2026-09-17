import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const monthlyData = [
  { month: "Jan", revenue: 13.5, expenses: 8.2 },
  { month: "Feb", revenue: 16.0, expenses: 9.5 },
  { month: "Mar", revenue: 14.8, expenses: 8.8 },
  { month: "Apr", revenue: 20.2, expenses: 11.0 },
  { month: "May", revenue: 23.0, expenses: 12.5 },
  { month: "Jun", revenue: 20.0, expenses: 11.2 },
  { month: "Jul", revenue: 25.4, expenses: 14.0 },
  { month: "Aug", revenue: 28.1, expenses: 15.2 },
  { month: "Sep", revenue: 24.5, expenses: 13.5 },
  { month: "Oct", revenue: 31.0, expenses: 16.8 },
  { month: "Nov", revenue: 28.5, expenses: 15.0 },
  { month: "Dec", revenue: 34.8, expenses: 18.2 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#3E3734] text-white text-[11px] rounded-lg py-1.5 px-3 shadow-lg font-medium border border-[#524B48]">
        <p className="font-bold border-b border-gray-600 pb-1 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: ${entry.value}k
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EarningsChart = () => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#3E3734]">Earnings Analytics</h2>
          <p className="text-xs text-[#817B77] mt-0.5">Revenue vs expenses over time</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C87A65]"></span>
            <span className="text-[#6E6763] font-medium">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8A817C]"></span>
            <span className="text-[#6E6763] font-medium">Expenses</span>
          </div>
        </div>
      </div>

      <div className="w-full flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyData}
            margin={{ top: 10, right: 25, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F2EBE5"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9E9792", fontSize: 8 }}
              padding={{ left: 10, right: 20 }}
            />
            <YAxis
              domain={[0, 36]}
              ticks={[0, 9, 18, 27, 36]}
              tickFormatter={(val) => `$${val}k`}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9E9792", fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#C87A65"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#FFFFFF", stroke: "#C87A65", strokeWidth: 1 }}
              activeDot={{ r: 5, fill: "#C87A65" }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#8A817C"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EarningsChart;
