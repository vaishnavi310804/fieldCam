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
        <p className="text-[#8B5CF6]">Approval Rate: {val !== null ? `${val}%` : "No data"}</p>
      </div>
    );
  }
  return null;
};

const ApprovalRateTrendChart = ({ data = [] }) => {
  const validPoints = data.filter((d) => d.rate !== null);
  const hasData = validPoints.length > 0;

  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[#2D3436]">Approval Rate Trend</h2>
        <p className="text-xs text-[#817B77] mt-0.5">
          Monthly approval percentage
        </p>
      </div>

      {/* Chart */}
      {!hasData ? (
        <div className="w-full flex-1 min-h-[200px] bg-[#FAF7F5] rounded-xl border border-dashed border-[#EBE6E3] flex flex-col items-center justify-center p-4 text-center">
          <p className="text-xs font-bold text-[#2D3436]">No approval rate trend available yet.</p>
          <p className="text-[11px] text-[#817B77] max-w-xs mt-1">
            Approval trends populate after project reviews are recorded.
          </p>
        </div>
      ) : (
        <div className="w-full flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApproval" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
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
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#817B77", fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rate"
                name="Approval Rate"
                stroke="#8B5CF6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorApproval)"
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ApprovalRateTrendChart;
