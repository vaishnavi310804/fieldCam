const WeeklyEarningsChart = ({ data = [] }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#EBE6E3] p-6 shadow-xs">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#2D3436]">This Week</h3>
        <p className="text-xs text-[#817B77] font-medium">Weekly earnings breakdown</p>
      </div>

      {/* 4 Vertical Bar Columns */}
      <div className="h-36 flex items-end justify-between gap-6 px-4 pt-2 border-b border-[#EBE6E3]">
        {data.map((w) => (
          <div key={w.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div
              style={{ height: `${w.heightPct}%` }}
              className={`w-full rounded-t-xl transition-all duration-500 ${
                w.isCurrent ? "bg-[#6C5CE7]" : "bg-[#6C5CE7]/20 hover:bg-[#6C5CE7]/40"
              }`}
            />
            <span className="text-xs font-bold text-[#817B77] pb-2">{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyEarningsChart;
