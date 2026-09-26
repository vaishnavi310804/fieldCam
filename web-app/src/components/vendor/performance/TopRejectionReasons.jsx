const TopRejectionReasons = ({ rejectionReasons = [] }) => {
  const hasData = rejectionReasons.length > 0;

  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="mb-4">
          <h2 className="text-sm font-bold text-[#2D3436]">Top Rejection Reasons</h2>
          <p className="text-xs text-[#817B77] mt-0.5">Common quality issues recorded on rejected submissions</p>
        </div>

        {!hasData ? (
          <div className="w-full min-h-[140px] bg-[#FAF7F5] rounded-xl border border-dashed border-[#EBE6E3] flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs font-bold text-[#2D3436]">No rejection reasons recorded.</p>
            <p className="text-[11px] text-[#817B77] max-w-xs mt-1">
              Projects rejected with specific feedback reasons will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rejectionReasons.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#2D3436]">
                  <span className="truncate">{item.reason}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[#817B77] font-medium">{item.count}×</span>
                    <span className="text-[#EF4444] font-bold text-[11px] min-w-[28px] text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#FAF7F5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#EF4444] transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopRejectionReasons;
