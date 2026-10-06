import { useState } from "react";
import { FiEdit3, FiCheck } from "react-icons/fi";
import { createSubscriptionPlan } from "../../services/subscriptionService";

const DraftSubscriptionPlan = ({ onPlanCreated = () => {} }) => {
  const [name, setName] = useState("");
  const [userLimit, setUserLimit] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [storageLimitGb, setStorageLimitGb] = useState("");

  const [features, setFeatures] = useState({
    Analytics: false,
    SSO: false,
    "Custom URL": false,
    "API Access": false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const toggleFeature = (feat) => {
    setFeatures((prev) => ({ ...prev, [feat]: !prev[feat] }));
  };

  const handleSubmit = async (targetStatus) => {
    if (!name.trim()) {
      setErrorMsg("Plan name is required");
      return;
    }
    if (monthlyPrice === "" || isNaN(Number(monthlyPrice))) {
      setErrorMsg("Valid monthly price is required");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const selectedFeatures = Object.keys(features).filter((k) => features[k]);

      const payload = {
        name: name.trim(),
        monthlyPrice: Number(monthlyPrice),
        userLimit: userLimit ? Number(userLimit) : -1,
        storageLimitGb: storageLimitGb ? Number(storageLimitGb) : -1,
        features: selectedFeatures,
        status: targetStatus, // "DRAFT" or "PUBLISHED"
      };

      await createSubscriptionPlan(payload);

      setSuccessMsg(
        `Subscription plan "${name}" successfully saved as ${targetStatus}!`
      );
      setName("");
      setUserLimit("");
      setMonthlyPrice("");
      setStorageLimitGb("");
      setFeatures({
        Analytics: false,
        SSO: false,
        "Custom URL": false,
        "API Access": false,
      });

      onPlanCreated();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to create plan"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FDF6F0] rounded-2xl border border-[#F3E5D8] p-6 shadow-xs">
      {/* Header section */}
      <div className="flex items-start gap-3.5 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#EBE4DC] text-[#6E6763] flex items-center justify-center shrink-0">
          <FiEdit3 size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#2D3436]">
            Draft New Subscription Model
          </h3>
          <p className="text-xs text-[#817B77] mt-0.5">
            Configure a custom plan for targeted marketing campaigns.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          {successMsg}
        </div>
      )}

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Plan Name */}
        <div>
          <label className="block text-[10px] font-bold text-[#817B77] uppercase tracking-wider mb-1.5">
            Plan Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Growth Pro"
            className="w-full h-10 bg-white border border-[#EBE6E3] rounded-xl px-3.5 text-xs text-[#2D3436] placeholder:text-[#B0AAA6] outline-none focus:border-[#817B77]"
          />
        </div>

        {/* User Limit */}
        <div>
          <label className="block text-[10px] font-bold text-[#817B77] uppercase tracking-wider mb-1.5">
            User Limit
          </label>
          <input
            type="number"
            value={userLimit}
            onChange={(e) => setUserLimit(e.target.value)}
            placeholder="25"
            className="w-full h-10 bg-white border border-[#EBE6E3] rounded-xl px-3.5 text-xs text-[#2D3436] placeholder:text-[#B0AAA6] outline-none focus:border-[#817B77]"
          />
        </div>

        {/* Monthly Price */}
        <div>
          <label className="block text-[10px] font-bold text-[#817B77] uppercase tracking-wider mb-1.5">
            Monthly Price (USD)
          </label>
          <input
            type="number"
            value={monthlyPrice}
            onChange={(e) => setMonthlyPrice(e.target.value)}
            placeholder="$ 99"
            className="w-full h-10 bg-white border border-[#EBE6E3] rounded-xl px-3.5 text-xs text-[#2D3436] placeholder:text-[#B0AAA6] outline-none focus:border-[#817B77]"
          />
        </div>

        {/* Storage */}
        <div>
          <label className="block text-[10px] font-bold text-[#817B77] uppercase tracking-wider mb-1.5">
            Storage (GB)
          </label>
          <input
            type="number"
            value={storageLimitGb}
            onChange={(e) => setStorageLimitGb(e.target.value)}
            placeholder="50"
            className="w-full h-10 bg-white border border-[#EBE6E3] rounded-xl px-3.5 text-xs text-[#2D3436] placeholder:text-[#B0AAA6] outline-none focus:border-[#817B77]"
          />
        </div>
      </div>

      {/* Premium Features Checkboxes */}
      <div className="mb-6">
        <label className="block text-[10px] font-bold text-[#817B77] uppercase tracking-wider mb-2">
          Premium Features
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.keys(features).map((feat) => {
            const isChecked = features[feat];
            return (
              <button
                key={feat}
                type="button"
                onClick={() => toggleFeature(feat)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white border text-xs font-medium transition-all cursor-pointer ${
                  isChecked
                    ? "border-[#817B77] text-[#2D3436] shadow-xs"
                    : "border-[#EBE6E3] text-[#817B77] hover:border-[#D8D2CD]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isChecked
                      ? "bg-[#817B77] border-[#817B77] text-white"
                      : "border-[#D8D2CD] bg-white"
                  }`}
                >
                  {isChecked && <FiCheck size={12} />}
                </div>
                <span>{feat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => handleSubmit("DRAFT")}
          className="px-5 py-2.5 rounded-xl bg-[#EBE4DC] hover:bg-[#E0D8CF] text-[#2D3436] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save as Draft"}
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={() => handleSubmit("PUBLISHED")}
          className="px-5 py-2.5 rounded-xl bg-[#817B77] hover:bg-[#6E6763] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {submitting ? "Publishing..." : "Publish Plan"}
        </button>
      </div>
    </div>
  );
};

export default DraftSubscriptionPlan;
