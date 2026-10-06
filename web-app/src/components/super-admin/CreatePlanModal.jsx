import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
} from "../../services/subscriptionService";

const CreatePlanModal = ({
  isOpen,
  onClose,
  onSuccess,
  planToEdit = null,
}) => {
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [userLimit, setUserLimit] = useState("");
  const [storageLimitGb, setStorageLimitGb] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [status, setStatus] = useState("PUBLISHED");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (planToEdit) {
      setName(planToEdit.name || "");
      setSubtitle(planToEdit.subtitle || "");
      setMonthlyPrice(planToEdit.monthlyPrice || 0);
      setUserLimit(
        planToEdit.userLimit === -1 ? "" : planToEdit.userLimit || ""
      );
      setStorageLimitGb(
        planToEdit.storageLimitGb === -1 ? "" : planToEdit.storageLimitGb || ""
      );
      setFeaturesText(
        Array.isArray(planToEdit.features)
          ? planToEdit.features.join("\n")
          : ""
      );
      setIsPopular(Boolean(planToEdit.isPopular));
      setStatus(planToEdit.status || "PUBLISHED");
    } else {
      setName("");
      setSubtitle("");
      setMonthlyPrice("");
      setUserLimit("");
      setStorageLimitGb("");
      setFeaturesText("");
      setIsPopular(false);
      setStatus("PUBLISHED");
    }
    setError("");
  }, [planToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Plan name is required");
      return;
    }
    if (monthlyPrice === "" || isNaN(Number(monthlyPrice))) {
      setError("Valid monthly price is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const features = featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        name: name.trim(),
        subtitle: subtitle.trim(),
        monthlyPrice: Number(monthlyPrice),
        userLimit: userLimit ? Number(userLimit) : -1,
        storageLimitGb: storageLimitGb ? Number(storageLimitGb) : -1,
        features,
        isPopular,
        status,
      };

      if (planToEdit?._id) {
        await updateSubscriptionPlan(planToEdit._id, payload);
      } else {
        await createSubscriptionPlan(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to save plan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#EBE6E3] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EBE6E3] flex items-center justify-between">
          <h3 className="text-base font-bold text-[#2D3436]">
            {planToEdit ? "Edit Subscription Plan" : "Create New Subscription Plan"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#817B77] hover:text-[#2D3436] hover:bg-[#F5F2F0] transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
              {error}
            </div>
          )}

          {/* Plan Name */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] mb-1">
              Plan Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Professional"
              className="w-full h-9 bg-[#FAF7F5] border border-[#EBE6E3] rounded-lg px-3 text-xs text-[#2D3436] outline-none focus:border-[#5141F5] focus:bg-white"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] mb-1">
              Description / Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Advanced tools for growing companies."
              className="w-full h-9 bg-[#FAF7F5] border border-[#EBE6E3] rounded-lg px-3 text-xs text-[#2D3436] outline-none focus:border-[#5141F5] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-[#2D3436] mb-1">
                Monthly Price (USD) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                placeholder="149"
                className="w-full h-9 bg-[#FAF7F5] border border-[#EBE6E3] rounded-lg px-3 text-xs text-[#2D3436] outline-none focus:border-[#5141F5] focus:bg-white"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-[#2D3436] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 bg-[#FAF7F5] border border-[#EBE6E3] rounded-lg px-2.5 text-xs text-[#2D3436] outline-none focus:border-[#5141F5] focus:bg-white"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* User Limit */}
            <div>
              <label className="block text-xs font-bold text-[#2D3436] mb-1">
                User Limit (Blank = Unlimited)
              </label>
              <input
                type="number"
                value={userLimit}
                onChange={(e) => setUserLimit(e.target.value)}
                placeholder="50"
                className="w-full h-9 bg-[#FAF7F5] border border-[#EBE6E3] rounded-lg px-3 text-xs text-[#2D3436] outline-none focus:border-[#5141F5] focus:bg-white"
              />
            </div>

            {/* Storage Limit */}
            <div>
              <label className="block text-xs font-bold text-[#2D3436] mb-1">
                Storage Limit (GB)
              </label>
              <input
                type="number"
                value={storageLimitGb}
                onChange={(e) => setStorageLimitGb(e.target.value)}
                placeholder="100"
                className="w-full h-9 bg-[#FAF7F5] border border-[#EBE6E3] rounded-lg px-3 text-xs text-[#2D3436] outline-none focus:border-[#5141F5] focus:bg-white"
              />
            </div>
          </div>

          {/* Features Checklist List */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] mb-1">
              Features (One per line)
            </label>
            <textarea
              rows={4}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder={`Up to 50 Users\n100GB NVMe Storage\nPriority Email Support\nAdvanced Analytics`}
              className="w-full bg-[#FAF7F5] border border-[#EBE6E3] rounded-lg p-3 text-xs text-[#2D3436] outline-none focus:border-[#5141F5] focus:bg-white"
            />
          </div>

          {/* Highlight Popular Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPopular"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="rounded border-gray-300 text-[#817B77] focus:ring-[#817B77]"
            />
            <label htmlFor="isPopular" className="text-xs font-medium text-[#2D3436] cursor-pointer">
              Mark as Popular / Featured Plan
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBE6E3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6E6763] hover:bg-[#F5F2F0] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#817B77] hover:bg-[#6E6763] text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : planToEdit ? "Update Plan" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanModal;
