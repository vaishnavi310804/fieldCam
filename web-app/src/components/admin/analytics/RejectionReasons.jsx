const rejectionData = [
  {
    reason: "Low Image Quality",
    count: 14,
    percentage: "32%",
    width: "32%",
    barColor: "bg-[#E07A5F]",
  },
  {
    reason: "Incomplete Coverage",
    count: 10,
    percentage: "23%",
    width: "23%",
    barColor: "bg-[#C87A65]",
  },
  {
    reason: "Wrong Angles",
    count: 8,
    percentage: "18%",
    width: "18%",
    barColor: "bg-[#D97706]",
  },
  {
    reason: "Missing Metadata",
    count: 6,
    percentage: "14%",
    width: "14%",
    barColor: "bg-[#8A817C]",
  },
  {
    reason: "Late Submission",
    count: 4,
    percentage: "9%",
    width: "9%",
    barColor: "bg-[#A39A94]",
  },
  {
    reason: "Other",
    count: 2,
    percentage: "4%",
    width: "4%",
    barColor: "bg-[#D5C9C2]",
  },
];

const RejectionReasons = () => {
  const totalRejections = 44;

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

        {/* Ranked List with Progress Bars */}
        <div className="space-y-3">
          {rejectionData.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#3E3734]">
                <span>{item.reason}</span>
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
      </div>

      {/* Footer Total */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F2EBE5] mt-4 text-xs">
        <span className="font-medium text-[#817B77]">Total Rejections</span>
        <span className="font-bold text-[#3E3734] text-sm">{totalRejections}</span>
      </div>
    </div>
  );
};

export default RejectionReasons;
