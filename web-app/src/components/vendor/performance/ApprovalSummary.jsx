import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#3E3734] text-white text-[11px] rounded-lg py-1 px-2.5 shadow-lg border border-[#524B48] font-medium">
        <p className="font-bold">{data.name}</p>
        <p style={{ color: data.fill }}>Projects: {data.value}</p>
      </div>
    );
  }
  return null;
};

const ApprovalSummary = ({ statusBreakdown = [], summary = {} }) => {
  const hasData = statusBreakdown.length > 0;
  const approvalRateDisplay = summary?.approvalRate !== null && summary?.approvalRate !== undefined
    ? `${summary.approvalRate}%`
    : "N/A";

  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="mb-2">
          <h2 className="text-sm font-bold text-[#2D3436]">Approval & Status Summary</h2>
          <p className="text-xs text-[#817B77] mt-0.5">Project status distribution</p>
        </div>

        {!hasData ? (
          <div className="w-full h-[160px] bg-[#FAF7F5] rounded-xl border border-dashed border-[#EBE6E3] flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs font-bold text-[#2D3436]">No project status data.</p>
          </div>
        ) : (
          <div className="w-full h-[160px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-black text-[#2D3436]">{approvalRateDisplay}</span>
              <span className="text-[9px] font-bold text-[#817B77] uppercase">APPROVAL</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend list below donut */}
      {hasData && (
        <div className="space-y-1.5 pt-2 border-t border-[#F2EBE5] mt-2">
          {statusBreakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-medium text-[#817B77]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                <span className="truncate">{item.name}</span>
              </div>
              <span className="font-bold text-[#2D3436] shrink-0 ml-2">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalSummary;
