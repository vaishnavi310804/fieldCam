import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-[#3E3734] text-white text-[11px] rounded-lg py-1.5 px-3 shadow-lg font-medium border border-[#524B48]">
        <p className="font-bold">{label}</p>
        <p className="text-[#06B6D4]">Avg Completion: {val !== null ? `${val} days` : "No data"}</p>
      </div>
    );
  }
  return null;
};

const CompletionTimeChart = ({ data = [] }) => {
  const validPoints = data.filter((d) => d.days !== null);
  const hasData = validPoints.length > 0;

  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-sm font-bold text-[#2D3436]">Completion Time</h2>
        <p className="text-xs text-[#817B77] mt-0.5">Avg. days per project</p>
      </div>

      {/* Chart */}
      {!hasData ? (
        <div className="w-full flex-1 min-h-[180px] bg-[#FAF7F5] rounded-xl border border-dashed border-[#EBE6E3] flex flex-col items-center justify-center p-4 text-center">
          <p className="text-xs font-bold text-[#2D3436]">No completion time data yet.</p>
          <p className="text-[11px] text-[#817B77] max-w-xs mt-1">
            Calculated when completed projects are recorded.
          </p>
        </div>
      ) : (
        <div className="w-full flex-1 min-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EBE5" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#817B77", fontSize: 10, fontWeight: 600 }}
              />
              <YAxis
                tickFormatter={(val) => `${val}d`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#817B77", fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="days"
                name="Avg Days"
                stroke="#06B6D4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorDays)"
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CompletionTimeChart;
