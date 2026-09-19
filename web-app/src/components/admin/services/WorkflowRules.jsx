import { FiGitBranch, FiChevronDown } from "react-icons/fi";

const WorkflowRules = ({
  serviceLogic,
  setServiceLogic,
  requireSignature,
  setRequireSignature,
  autoApprove,
  setAutoApprove,
  notifyClient,
  setNotifyClient,
  processingMode,
  setProcessingMode,
  readOnly = false,
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

      {/* Processing Mode */}
      <div>
        <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
          Processing Mode
        </label>
        <div className="relative">
          <select
            value={processingMode || "AUTOMATIC"}
            onChange={(e) => setProcessingMode(e.target.value)}
            disabled={readOnly}
            className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors appearance-none cursor-pointer pr-10 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <option value="AUTOMATIC">AUTOMATIC</option>
            <option value="MANUAL">MANUAL</option>
          </select>
          <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
          Service Logic
        </label>
        <textarea
          rows={3}
          value={serviceLogic}
          onChange={(e) => setServiceLogic(e.target.value)}
          disabled={readOnly}
          className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3 text-[11px] font-mono text-[#4A423F] outline-none focus:border-[#C8B5AC] transition-colors resize-none leading-relaxed disabled:opacity-75 disabled:cursor-not-allowed"
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
            disabled={readOnly}
            className="w-4 h-4 rounded border-[#E8E2DE] text-[#8A817C] focus:ring-0 cursor-pointer accent-[#8A817C] disabled:cursor-not-allowed"
          />
          <span>Require signature on completion</span>
        </label>

        {/* Checkbox 2 */}
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[#3E3734]">
          <input
            type="checkbox"
            checked={autoApprove}
            onChange={(e) => setAutoApprove(e.target.checked)}
            disabled={readOnly}
            className="w-4 h-4 rounded border-[#E8E2DE] text-[#8A817C] focus:ring-0 cursor-pointer accent-[#8A817C] disabled:cursor-not-allowed"
          />
          <span>Auto-approve invoices &lt; $500</span>
        </label>

        {/* Checkbox 3 */}
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[#3E3734]">
          <input
            type="checkbox"
            checked={notifyClient}
            onChange={(e) => setNotifyClient(e.target.checked)}
            disabled={readOnly}
            className="w-4 h-4 rounded border-[#E8E2DE] text-[#8A817C] focus:ring-0 cursor-pointer accent-[#8A817C] disabled:cursor-not-allowed"
          />
          <span>Notify client on dispatch</span>
        </label>
      </div>
    </div>
  );
};

export default WorkflowRules;
