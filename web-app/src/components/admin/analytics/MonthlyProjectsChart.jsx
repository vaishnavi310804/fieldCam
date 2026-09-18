import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const monthlyProjectsData = [
  { month: "Jul", submitted: 24, completed: 18 },
  { month: "Aug", submitted: 28, completed: 22 },
  { month: "Sep", submitted: 31, completed: 25 },
  { month: "Oct", submitted: 38, completed: 30 },
  { month: "Nov", submitted: 34, completed: 28 },
  { month: "Dec", submitted: 42, completed: 35 },
  { month: "Jan", submitted: 40, completed: 32 },
  { month: "Feb", submitted: 46, completed: 38 },
  { month: "Mar", submitted: 32, completed: 26 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#3E3734] text-white text-[11px] rounded-lg py-1.5 px-3 shadow-lg font-medium border border-[#524B48]">
        <p className="font-bold border-b border-gray-600 pb-1 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: {entry.value} projects
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MonthlyProjectsChart = () => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#3E3734]">Monthly Projects</h2>
          <p className="text-xs text-[#817B77] mt-0.5">
            Completed vs submitted volume
          </p>
        </div>

        {/* Legend dots */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E07A5F]"></span>
            <span className="text-[#6E6763] font-medium">Submitted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
            <span className="text-[#6E6763] font-medium">Completed</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={monthlyProjectsData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E07A5F" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#E07A5F" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
              domain={[0, 60]}
              ticks={[0, 15, 30, 45, 60]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9E9792", fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="submitted"
              name="Submitted"
              stroke="#E07A5F"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSubmitted)"
            />
            <Area
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorCompleted)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyProjectsChart;
