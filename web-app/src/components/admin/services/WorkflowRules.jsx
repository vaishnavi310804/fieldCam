import { FiGitBranch } from "react-icons/fi";

const WorkflowRules = ({
  serviceLogic,
  setServiceLogic,
  requireSignature,
  setRequireSignature,
  autoApprove,
  setAutoApprove,
  notifyClient,
  setNotifyClient,
}) => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#F2EBE5] text-[#6E6763] flex items-center justify-center shrink-0">
          <FiGitBranch className="text-sm" />
        </div>
        <h2 className="text-sm font-bold text-[#3E3734]">Workflow Rules</h2>
      </div>

      {/* Service Logic Field */}
      <div>
        <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
          Service Logic
        </label>
        <textarea
          rows={3}
          value={serviceLogic}
          onChange={(e) => setServiceLogic(e.target.value)}
          className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3 text-[11px] font-mono text-[#4A423F] outline-none focus:border-[#C8B5AC] transition-colors resize-none leading-relaxed"
        />
      </div>

      {/* Checkboxes */}
      <div className="space-y-3 pt-1">
        {/* Checkbox 1 */}
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[#3E3734]">
          <input
            type="checkbox"
            checked={requireSignature}
            onChange={(e) => setRequireSignature(e.target.checked)}
            className="w-4 h-4 rounded border-[#E8E2DE] text-[#8A817C] focus:ring-0 cursor-pointer accent-[#8A817C]"
          />
          <span>Require signature on completion</span>
        </label>

        {/* Checkbox 2 */}
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[#3E3734]">
          <input
            type="checkbox"
            checked={autoApprove}
            onChange={(e) => setAutoApprove(e.target.checked)}
            className="w-4 h-4 rounded border-[#E8E2DE] text-[#8A817C] focus:ring-0 cursor-pointer accent-[#8A817C]"
          />
          <span>Auto-approve invoices &lt; $500</span>
        </label>

        {/* Checkbox 3 */}
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[#3E3734]">
          <input
            type="checkbox"
            checked={notifyClient}
            onChange={(e) => setNotifyClient(e.target.checked)}
            className="w-4 h-4 rounded border-[#E8E2DE] text-[#8A817C] focus:ring-0 cursor-pointer accent-[#8A817C]"
          />
          <span>Notify client on dispatch</span>
        </label>
      </div>
    </div>
  );
};

export default WorkflowRules;
