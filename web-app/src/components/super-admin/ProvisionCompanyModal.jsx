import { useState, useEffect, useMemo, useCallback } from "react";
import { FiX, FiPlus, FiBriefcase, FiMail, FiUser, FiPhone, FiMapPin, FiLayers, FiCalendar, FiClock, FiChevronDown } from "react-icons/fi";
import { createCompany } from "../../services/companyService";
import { getSubscriptionPlans } from "../../services/subscriptionService";
import { calculateExpiryDate, formatDisplayDate } from "../../utils/subscriptionUtils";

const ProvisionCompanyModal = ({
  isOpen,
  onClose,
  onSuccess = () => {},
}) => {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    location: "",
    services: "",
  });

  // Subscription state
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [durationMonths, setDurationMonths] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      setPlansError("");
      const res = await getSubscriptionPlans({ status: "PUBLISHED" });
      const published = res.data || [];
      setPlans(published);
      if (published.length > 0) {
        setSelectedPlanId(published[0]._id);
      } else {
        setSelectedPlanId("");
      }
    } catch (err) {
      console.error("Failed to load subscription plans:", err);
      setPlansError(
        err.response?.data?.message || err.message || "Failed to load subscription plans from server"
      );
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      location: "",
      services: "",
    });
    setStartDate(new Date().toISOString().split("T")[0]);
    setDurationMonths(1);
    setError("");
    fetchPlans();
  }, [isOpen, fetchPlans]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p._id === selectedPlanId),
    [plans, selectedPlanId]
  );

  const expiryDatePreview = useMemo(() => {
    if (!startDate || !durationMonths) return null;
    return calculateExpiryDate(startDate, durationMonths);
  }, [startDate, durationMonths]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      setError("Company Name is required.");
      return;
    }
    if (!formData.contactName.trim()) {
      setError("Contact Name is required.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Contact Email is required.");
      return;
    }
    if (!selectedPlanId) {
      setError("Please select a subscription plan.");
      return;
    }
    if (!startDate) {
      setError("Please select a subscription start date.");
      return;
    }
    if (!durationMonths || durationMonths < 1) {
      setError("Please select a valid duration of at least 1 month.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        companyName: formData.companyName.trim(),
        contactName: formData.contactName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone ? formData.phone.trim() : undefined,
        location: formData.location ? formData.location.trim() : "Global",
        services: formData.services
          ? formData.services.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        planId: selectedPlanId,
        startDate,
        durationMonths: Number(durationMonths),
      };

      await createCompany(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to provision company account. Please check input parameters."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#EBE6E3] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF7F5] border-b border-[#EBE6E3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#5141F5] text-white flex items-center justify-center">
              <FiBriefcase className="text-sm" />
            </div>
            <h2 className="text-base font-bold text-[#2D3436]">
              Provision New Company
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#817B77] hover:text-[#2D3436] hover:bg-[#F5F2F0] rounded-lg transition cursor-pointer"
          >
            <FiX className="text-sm" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-[#2D3436] mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Vortex Dynamics Ltd"
                className="w-full h-9 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg pl-9 pr-3 text-xs text-[#2D3436] placeholder:text-[#9CA3AF] outline-none focus:border-[#5141F5] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Contact Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2D3436] mb-1">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full h-9 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg pl-9 pr-3 text-xs text-[#2D3436] placeholder:text-[#9CA3AF] outline-none focus:border-[#5141F5] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D3436] mb-1">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="sarah@vortex-dyn.com"
                  className="w-full h-9 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg pl-9 pr-3 text-xs text-[#2D3436] placeholder:text-[#9CA3AF] outline-none focus:border-[#5141F5] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Phone & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2D3436] mb-1">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  className="w-full h-9 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg pl-9 pr-3 text-xs text-[#2D3436] placeholder:text-[#9CA3AF] outline-none focus:border-[#5141F5] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D3436] mb-1">
                Location / Region
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="New York, USA"
                  className="w-full h-9 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg pl-9 pr-3 text-xs text-[#2D3436] placeholder:text-[#9CA3AF] outline-none focus:border-[#5141F5] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Services / Plan */}
          <div>
            <label className="block text-xs font-semibold text-[#2D3436] mb-1">
              Services / Offerings (comma-separated)
            </label>
            <input
              type="text"
              name="services"
              value={formData.services}
              onChange={handleChange}
              placeholder="Field Survey, Site Audit, Drone Inspection"
              className="w-full h-9 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg px-3 text-xs text-[#2D3436] placeholder:text-[#9CA3AF] outline-none focus:border-[#5141F5] focus:bg-white transition"
            />
          </div>

          {/* Subscription Configuration Section */}
          <div className="pt-3 border-t border-[#EBE6E3] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#2D3436] flex items-center gap-1.5 uppercase tracking-wider">
                <FiLayers className="text-[#5141F5]" />
                <span>Subscription Configuration</span>
              </h3>
              <span className="text-[10px] font-bold text-[#817B77] uppercase tracking-wider">
                Required
              </span>
            </div>

            {loadingPlans && (
              <div className="py-3 text-center text-xs text-[#817B77] bg-[#FAF7F5] rounded-xl border border-[#EBE6E3]">
                <div className="inline-block w-4 h-4 border-2 border-[#817B77] border-t-transparent rounded-full animate-spin mr-2" />
                Loading published subscription plans...
              </div>
            )}

            {plansError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center justify-between">
                <span>{plansError}</span>
                <button
                  type="button"
                  onClick={fetchPlans}
                  className="font-bold underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {!loadingPlans && !plansError && plans.length === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                No published subscription plans available. Please publish a plan in Subscriptions before provisioning a company.
              </div>
            )}

            {!loadingPlans && plans.length > 0 && (
              <div className="space-y-3">
                {/* Plan Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-[#2D3436] mb-1">
                    Select Plan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      required
                      className="w-full h-9 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg px-3 text-xs text-[#2D3436] outline-none focus:border-[#5141F5] focus:bg-white transition appearance-none cursor-pointer pr-10"
                    >
                      <option value="">Choose a subscription plan...</option>
                      {plans.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} — ${p.monthlyPrice}/mo ({p.userLimit === -1 ? "Unlimited" : p.userLimit} Users, {p.storageLimitGb === -1 ? "Unlimited" : p.storageLimitGb + " GB"} Storage)
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
                  </div>
                </div>

                {/* Selected Plan Details Preview Card */}
                {selectedPlan && (
                  <div className="bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2D3436]">
                          {selectedPlan.name}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[#EBE6E3] text-[#6E6763]">
                          {selectedPlan.code}
                        </span>
                      </div>
                      <span className="font-bold text-[#5141F5]">
                        ${selectedPlan.monthlyPrice} / month
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[#6E6763] pt-0.5">
                      <div>
                        <strong className="text-[#2D3436]">User Limit:</strong>{" "}
                        {selectedPlan.userLimit === -1 ? "Unlimited" : `${selectedPlan.userLimit} Users`}
                      </div>
                      <div>
                        <strong className="text-[#2D3436]">Storage:</strong>{" "}
                        {selectedPlan.storageLimitGb === -1 ? "Unlimited" : `${selectedPlan.storageLimitGb} GB`}
                      </div>
                    </div>

                    {Array.isArray(selectedPlan.features) && selectedPlan.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {selectedPlan.features.map((feat, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-[#EBE6E3] px-2 py-0.5 rounded text-[10px] text-[#6E6763]"
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Start Date & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2D3436] mb-1 flex items-center gap-1">
                      <FiCalendar className="text-[#817B77]" />
                      <span>Start Date <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-9 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg px-3 text-xs text-[#2D3436] outline-none focus:border-[#5141F5] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D3436] mb-1 flex items-center gap-1">
                      <FiClock className="text-[#817B77]" />
                      <span>Duration <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative">
                      <select
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(Number(e.target.value))}
                        className="w-full h-9 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg px-3 text-xs text-[#2D3436] outline-none focus:border-[#5141F5] focus:bg-white transition appearance-none cursor-pointer pr-10"
                      >
                        <option value={1}>1 Month</option>
                        <option value={3}>3 Months (Quarterly)</option>
                        <option value={6}>6 Months (Semi-annual)</option>
                        <option value={12}>12 Months (Annual)</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Expiry / Renewal Date Live Preview */}
                <div className="bg-[#F8F7FF] border border-[#5141F5]/20 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <span className="text-[#6E6763] font-medium">Calculated Expiry / Renewal Date:</span>
                  <span className="font-bold text-[#5141F5]">
                    {expiryDatePreview ? formatDisplayDate(expiryDatePreview) : "—"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#EBE6E3] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#6E6763] hover:text-[#2D3436] hover:bg-[#F5F2F0] rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5141F5] hover:bg-[#4535E8] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlus className="text-xs" />
              <span>{loading ? "Provisioning..." : "Provision Company"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProvisionCompanyModal;
