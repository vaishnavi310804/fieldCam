import { FiUsers, FiInfo } from "react-icons/fi";

const StaffPerformanceFallback = () => {
  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[#2D3436] font-bold text-sm">
          <FiUsers className="text-[#8B5CF6]" />
          <span>Staff Performance</span>
        </div>
        <span className="text-[10px] font-bold text-[#817B77] bg-[#FAF7F5] px-2.5 py-1 rounded-full border border-[#EBE6E3]">
          Vendor Scope Only
        </span>
      </div>

      <div className="bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl p-4 flex items-start gap-3">
        <FiInfo className="text-[#8B5CF6] text-base shrink-0 mt-0.5" />
        <div className="text-xs text-[#817B77] leading-relaxed">
          <p className="font-bold text-[#2D3436] mb-1">
            Staff-level performance tracking is not enabled for your account role.
          </p>
          <p>
            Individual team member metrics are not assigned at the project level. Showing vendor-wide performance metrics only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffPerformanceFallback;
