const RejectionReasons = ({ data = null, loading = false }) => {
  const rejectionItems = Array.isArray(data?.items) ? data.items : [];
  const totalRejections = data?.totalRejections ?? 0;

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-[#3E3734]">
            Rejection Reasons
          </h2>
          <p className="text-xs text-[#817B77] mt-0.5">
            Top causes for submission rejections
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-xs text-[#817B77]">Loading rejection statistics...</p>
          </div>
        ) : rejectionItems.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs font-medium text-[#817B77]">
              No rejection reasons recorded
            </p>
          </div>
        ) : (
          /* Ranked List with Progress Bars */
          <div className="space-y-3">
            {rejectionItems.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#3E3734]">
                  <span className="truncate max-w-[150px]">{item.reason}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#817B77] font-medium">
                      {item.count}
                    </span>
                    <span className="text-[#C87A65] font-bold text-[11px] min-w-[28px] text-right">
                      {item.percentage}
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full bg-[#F7F4F2] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.barColor} transition-all duration-500`}
                    style={{ width: item.width }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Total */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F2EBE5] mt-4 text-xs">
        <span className="font-medium text-[#817B77]">Total Rejections</span>
        <span className="font-bold text-[#3E3734] text-sm">
          {loading ? "..." : totalRejections}
        </span>
      </div>
    </div>
  );
};

export default RejectionReasons;
