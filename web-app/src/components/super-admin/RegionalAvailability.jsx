import { FiInfo, FiExternalLink } from "react-icons/fi";

const RegionalAvailability = ({ availabilityData }) => {
  const isAvailable = availabilityData?.isAvailable && Array.isArray(availabilityData?.regions) && availabilityData.regions.length > 0;

  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-base font-bold text-[#2D3436]">Regional Availability</h2>
          <span className="text-[10px] font-bold text-[#817B77] bg-[#F5F2F0] px-4 py-0.5 rounded-full border border-[#EBE6E3]">
            {isAvailable ? "Active" : "Inactive"}
          </span>
        </div>

        {!isAvailable ? (
          <div className="my-4 p-4 rounded-xl bg-[#F8F7FF] border border-[#EBE6E3] text-center">
            <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-2">
              <FiInfo className="text-base" />
            </div>
            <h3 className="text-xs font-bold text-[#2D3436] mb-1">
              Unavailable
            </h3>
            <p className="text-[11px] text-[#817B77] leading-relaxed max-w-xs mx-auto">
              Real-time regional server not available.
            </p>
          </div>
        ) : (
          <div className="space-y-3 my-2">
            {availabilityData.regions.map((region, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F5] border border-[#EBE6E3]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-[#2D3436]">{region.name}</span>
                </div>
                <span className="text-xs font-semibold text-[#817B77]">
                  {region.uptime}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[#EBE6E3] text-center">
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#817B77] hover:text-[#2D3436] cursor-not-allowed opacity-75"
        >
          <span>View System Status Page</span>
          <FiExternalLink className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default RegionalAvailability;
