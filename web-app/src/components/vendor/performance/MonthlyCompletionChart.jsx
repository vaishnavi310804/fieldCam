import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

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

const MonthlyCompletionChart = ({ data = [] }) => {
  const hasData = data.some((d) => d.completed > 0 || d.submitted > 0);

  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#2D3436]">Monthly Project Completion</h2>
          <p className="text-xs text-[#817B77] mt-0.5">
            Completed vs submitted projects
          </p>
        </div>

        {/* Legend dots */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
            <span className="text-[#817B77]">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
            <span className="text-[#817B77]">Submitted</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      {!hasData ? (
        <div className="w-full flex-1 min-h-[220px] bg-[#FAF7F5] rounded-xl border border-dashed border-[#EBE6E3] flex flex-col items-center justify-center p-4 text-center">
          <p className="text-xs font-bold text-[#2D3436]">No monthly project data recorded yet.</p>
          <p className="text-[11px] text-[#817B77] max-w-xs mt-1">
            Projects submitted and completed across months will populate here.
          </p>
        </div>
      ) : (
        <div className="w-full flex-1 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Bar dataKey="submitted" name="Submitted" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MonthlyCompletionChart;
