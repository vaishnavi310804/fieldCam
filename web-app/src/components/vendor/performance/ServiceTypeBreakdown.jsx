const ServiceTypeBreakdown = ({ workTypes = [] }) => {
  const hasData = workTypes.length > 0;

  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-[#2D3436]">Work Types</h2>
          <p className="text-xs text-[#817B77] mt-0.5">Project breakdown by category</p>
        </div>

        {!hasData ? (
          <div className="w-full min-h-[160px] bg-[#FAF7F5] rounded-xl border border-dashed border-[#EBE6E3] flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs font-bold text-[#2D3436]">No work type categories recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workTypes.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#2D3436]">
                  <span className="truncate">{item.name}</span>
                  <span className="text-[#817B77] font-bold shrink-0 ml-2">
                    {item.count} {item.count === 1 ? "project" : "projects"}
                  </span>
                </div>
                <div className="w-full bg-[#FAF7F5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#8B5CF6] transition-all duration-500"
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

export default ServiceTypeBreakdown;
