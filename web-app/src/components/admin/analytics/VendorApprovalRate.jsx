import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#3E3734] text-white text-[11px] rounded-lg py-1 px-2.5 shadow-lg border border-[#524B48] font-medium">
        <p className="font-bold">{data.name}</p>
        {data.hasReviews ? (
          <p className="text-[#10B981]">
            Approval Rate: {data.score}% ({data.approvedCount}/{data.evaluatedCount} approved)
          </p>
        ) : (
          <p className="text-[#D5C9C2]">
            No reviewed submissions yet (0 evaluated)
          </p>
        )}
      </div>
    );
  }
  return null;
};

const VendorApprovalRate = ({ data = [], loading = false }) => {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-sm font-bold text-[#3E3734]">Vendor Approval Rate</h2>
        <p className="text-xs text-[#817B77] mt-0.5">Quality scores by vendor</p>
      </div>

      {/* Chart */}
      <div className="w-full flex-1 min-h-[260px] flex items-center justify-center">
        {loading ? (
          <p className="text-xs text-[#817B77]">Loading vendor performance...</p>
        ) : chartData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs font-medium text-[#817B77]">
              No vendor performance data available
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
                axisLine={{ stroke: "#F2EBE5" }}
                tick={{ fill: "#9E9792", fontSize: 9 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#4A423F", fontSize: 10, fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={10}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || "#10B981"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default VendorApprovalRate;
