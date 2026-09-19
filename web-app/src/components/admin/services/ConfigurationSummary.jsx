import { FiHelpCircle } from "react-icons/fi";

const ConfigurationSummary = ({ serviceCategory, checklistCount, processingMode = "AUTOMATIC" }) => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
      {/* Title */}
      <h3 className="text-xs font-bold tracking-wider text-[#A39A94] uppercase">
        CONFIGURATION SUMMARY
      </h3>

      {/* Rows */}
      <div className="space-y-3.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#817B77] font-medium">Service Category</span>
          <span className="font-bold text-[#3E3734]">{serviceCategory}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#817B77] font-medium">Photos Required</span>
          <span className="font-bold text-[#3E3734]">
            {checklistCount} {checklistCount === 1 ? "Item" : "Items"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#817B77] font-medium">Processing Mode</span>
          <span className="bg-[#FAF7F5] border border-[#E8E2DE] text-[#6E6763] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
            {processingMode}
          </span>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-3.5 flex items-start gap-3 mt-4">
        <div className="w-7 h-7 rounded-full bg-white border border-[#E8E2DE] text-[#6E6763] flex items-center justify-center shrink-0 mt-0.5">
          <FiHelpCircle className="text-sm" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#3E3734]">Need help?</h4>
          <p className="text-[11px] text-[#817B77] mt-0.5 leading-snug">
            View documentation on how to write complex workflow rules.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationSummary;
