import { useState } from "react";
import { FiCpu } from "react-icons/fi";

const AIValidationSettings = () => {
  const [confidence, setConfidence] = useState(85);
  const [sensitivity, setSensitivity] = useState("Medium");
  const [autoVerifyTax, setAutoVerifyTax] = useState(false);
  const [imageCheck, setImageCheck] = useState(false);

  return (
    <div id="ai-validation" className="space-y-3">
      <h2 className="text-base font-bold text-[#2D3436] flex items-center gap-2">
        <FiCpu className="text-[#817B77]" />
        <span>AI Validation Settings</span>
      </h2>

      <div className="bg-white rounded-2xl border border-[#EBE6E3] p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Confidence Threshold */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#2D3436]">
                  Confidence Threshold
                </label>
                <span className="text-xs font-extrabold text-[#2D3436]">
                  {confidence}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full accent-[#817B77] bg-[#FAF7F5] h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-[#817B77] mt-1.5">
                Minimum probability required for automated approval without human review.
              </p>
            </div>

            {/* Model Sensitivity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#2D3436]">
                  Model Sensitivity
                </label>
                <span className="text-xs font-extrabold text-[#2D3436]">
                  {sensitivity}
                </span>
              </div>
              <select
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value)}
                className="w-full h-9 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl px-3 text-xs text-[#2D3436] outline-none focus:border-[#817B77]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Strict">Strict</option>
              </select>
              <p className="text-[11px] text-[#817B77] mt-1.5">
                Balance between False Positives and False Negatives.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Auto-verify Tax IDs */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-[#2D3436]">
                  Auto-verify Tax IDs
                </h4>
                <p className="text-[11px] text-[#817B77] mt-0.5">
                  Enable OCR-based verification of business tax documentation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoVerifyTax(!autoVerifyTax)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoVerifyTax ? "bg-[#817B77]" : "bg-[#EBE6E3]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    autoVerifyTax ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Image Quality Check */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-[#2D3436]">
                  Image Quality Check
                </h4>
                <p className="text-[11px] text-[#817B77] mt-0.5">
                  Automatically reject blurry or low-resolution document uploads.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImageCheck(!imageCheck)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  imageCheck ? "bg-[#817B77]" : "bg-[#EBE6E3]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    imageCheck ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIValidationSettings;
