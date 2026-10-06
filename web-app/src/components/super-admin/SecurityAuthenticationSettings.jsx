import { useState } from "react";
import { FiShield, FiPlus, FiX } from "react-icons/fi";

const SecurityAuthenticationSettings = () => {
  const [mfaMode, setMfaMode] = useState("Mandatory");
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [ipInput, setIpInput] = useState("");
  const [ipRanges, setIpRanges] = useState(["192.168.1.1/32"]);
  const [bannerMsg, setBannerMsg] = useState("");

  const handleAddIp = () => {
    if (!ipInput.trim()) return;
    setIpRanges((prev) => [...prev, ipInput.trim()]);
    setIpInput("");
  };

  const handleRemoveIp = (index) => {
    setIpRanges((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDiscard = () => {
    setMfaMode("Mandatory");
    setSessionTimeout(30);
    setIpInput("");
    setIpRanges(["192.168.1.1/32"]);
    setBannerMsg("Configuration reset to initial state.");
    setTimeout(() => setBannerMsg(""), 3000);
  };

  const handleSave = () => {
    setBannerMsg("Settings updated locally (UI Prototype Only).");
    setTimeout(() => setBannerMsg(""), 4000);
  };

  return (
    <div id="security" className="space-y-6">
      <h2 className="text-base font-bold text-rose-600 flex items-center gap-2">
        <FiShield />
        <span>Security & Authentication</span>
      </h2>

      {bannerMsg && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium animate-in fade-in duration-200">
          {bannerMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#EBE6E3] p-6 space-y-6 shadow-xs">
        {/* Multi-Factor Authentication */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EBE6E3]">
          <div>
            <h4 className="text-xs font-bold text-[#2D3436]">
              Multi-Factor Authentication (MFA)
            </h4>
            <p className="text-[11px] text-[#817B77] mt-0.5">
              Enforce secondary verification for all administrative accounts.
            </p>
          </div>

          <div className="inline-flex p-1 bg-[#F5F2F0] rounded-xl border border-[#EBE6E3] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMfaMode("Mandatory")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mfaMode === "Mandatory"
                  ? "bg-white text-[#2D3436] shadow-xs font-bold"
                  : "text-[#817B77] hover:text-[#2D3436]"
              }`}
            >
              Mandatory
            </button>
            <button
              type="button"
              onClick={() => setMfaMode("Optional")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mfaMode === "Optional"
                  ? "bg-white text-[#2D3436] shadow-xs font-bold"
                  : "text-[#817B77] hover:text-[#2D3436]"
              }`}
            >
              Optional
            </button>
          </div>
        </div>

        {/* Session Timeout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EBE6E3]">
          <div>
            <h4 className="text-xs font-bold text-[#2D3436]">
              Session Timeout
            </h4>
            <p className="text-[11px] text-[#817B77] mt-0.5">
              Duration of inactivity before the user is automatically logged out.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number"
              min="5"
              max="1440"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(Number(e.target.value))}
              className="w-20 h-9 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl px-3 text-center text-xs font-bold text-[#2D3436] outline-none focus:border-[#817B77]"
            />
            <span className="text-xs text-[#817B77]">minutes</span>
          </div>
        </div>

        {/* IP Whitelisting */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-[#2D3436]">
              IP Whitelisting
            </h4>
            <p className="text-[11px] text-[#817B77] mt-0.5">
              Restrict admin access to specific IP ranges (comma separated).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="e.g. 192.168.1.1, 10.0.0.0/24"
              className="flex-1 h-10 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl px-4 text-xs text-[#2D3436] placeholder:text-[#B0AAA6] outline-none focus:border-[#817B77]"
            />
            <button
              type="button"
              onClick={handleAddIp}
              className="px-4 py-2.5 rounded-xl bg-[#817B77] hover:bg-[#6E6763] text-white text-xs font-semibold cursor-pointer shrink-0 transition-colors"
            >
              Add Range
            </button>
          </div>

          {/* Added IP chips */}
          {ipRanges.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {ipRanges.map((ip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF7F5] border border-[#EBE6E3] text-xs text-[#2D3436] font-mono"
                >
                  <span>{ip}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIp(idx)}
                    className="text-[#817B77] hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <FiX size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Page Bottom Actions */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={handleDiscard}
          className="px-5 py-2.5 rounded-xl bg-white border border-[#EBE6E3] hover:bg-[#F5F2F0] text-[#2D3436] text-xs font-semibold transition-colors cursor-pointer"
        >
          Discard Changes
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#817B77] hover:bg-[#6E6763] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
};

export default SecurityAuthenticationSettings;
