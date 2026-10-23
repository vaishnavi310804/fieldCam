import { useState, useEffect, useMemo, useCallback } from "react";
import { FiX, FiPlus, FiAlertCircle, FiChevronDown, FiCalendar, FiClock, FiLayers } from "react-icons/fi";
import { getSubscriptionPlans } from "../../../services/subscriptionService";
import { calculateExpiryDate, formatDisplayDate } from "../../../utils/subscriptionUtils";

const AddVendorModal = ({ isOpen, onClose, onCreateVendor }) => {
  // Form state for actual Vendor backend fields
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [servicesInput, setServicesInput] = useState("");
  const [status, setStatus] = useState("Active");
  const [rating, setRating] = useState("4.0");

  // Subscription configuration state
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [durationMonths, setDurationMonths] = useState(1);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const resetForm = async () => {
      setCompanyName("");
      setContactName("");
      setPhone("");
      setEmail("");
      setLocation("");
      setServicesInput("Site Inspection");
      setStatus("Active");
      setRating("4.0");
      setStartDate(new Date().toISOString().split("T")[0]);
      setDurationMonths(1);
      setError("");
      await fetchPlans();
    };

    resetForm();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!companyName.trim()) {
      setError("Please enter a Vendor / Company Name.");
      return;
    }
    if (!contactName.trim()) {
      setError("Please enter a Contact Name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter a Contact Number.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter an Email Address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!location.trim()) {
      setError("Please enter a Location.");
      return;
    }
    if (!selectedPlanId) {
      setError("Please select a subscription plan for the company.");
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

    const servicesArray = servicesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      location: location.trim(),
      services: servicesArray.length > 0 ? servicesArray : ["Site Inspection"],
      status,
      rating: Number(rating || 4),
      planId: selectedPlanId,
      startDate,
      durationMonths: Number(durationMonths),
    };

    try {
      setIsSubmitting(true);
      await onCreateVendor(payload);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create vendor"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-[#EEE9E6] border border-[#E8E2DE] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#3E3734]">Add New Vendor</h2>
            <p className="text-xs text-[#817B77] mt-0.5">
              Create a new vendor to assign projects.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#817B77] hover:text-[#3E3734] p-1.5 rounded-xl hover:bg-[#EAE4DF] transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <FiAlertCircle className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content Card - Vendor Details */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4"
        >
          <h3 className="text-sm font-bold text-[#3E3734] mb-2">
            Vendor Details
          </h3>

          <div className="space-y-4">
            {/* Row 1: Vendor Name & Contact Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vendor Name */}
              <div>
                <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                  Vendor Name <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name.."
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
                />
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                  Contact Name <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Contact Number & Email Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact Number */}
              <div>
                <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                  Contact Number <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91"
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                  Email Address <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendor@example.com"
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Location (Full Width) */}
            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                Location <span className="text-[#C62828]">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Your Company Location.."
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
              />
            </div>

            {/* Row 3: Services Provided & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Services Provided */}
              <div>
                <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                  Services Provided
                </label>
                <input
                  type="text"
                  value={servicesInput}
                  onChange={(e) => setServicesInput(e.target.value)}
                  placeholder="Company Services..."
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                  Status <span className="text-[#C62828]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors appearance-none cursor-pointer pr-10"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 4: Initial Rating */}
            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                Rating (0 - 5)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="4.0"
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-semibold outline-none focus:border-[#C8B5AC] transition-colors"
              />
            </div>
          </div>

          {/* Subscription Configuration Section */}
          <div className="pt-4 border-t border-[#E8E2DE] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#3E3734] flex items-center gap-2">
                <span>Subscription Plans</span>
              </h3>
            </div>

            {/* Loading State */}
            {loadingPlans && (
              <div className="py-4 text-center text-xs text-[#817B77] bg-[#FAF7F5] rounded-xl border border-[#E8E2DE]">
                <div className="inline-block w-4 h-4 border-2 border-[#817B77] border-t-transparent rounded-full animate-spin mr-2" />
                Loading published subscription plans...
              </div>
            )}

            {/* Empty State */}
            {!loadingPlans && !plansError && plans.length === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                No published subscription plans available.
              </div>
            )}

            {/* Plan Configuration Fields */}
            {!loadingPlans && plans.length > 0 && (
              <div className="space-y-3">
                {/* Plan Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                    Select Plan <span className="text-[#C62828]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      required
                      className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors appearance-none cursor-pointer pr-10"
                    >
                      <option value="">Choose a subscription plan...</option>
                      {plans.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} — ${p.monthlyPrice}/mo ({p.userLimit === -1 ? "Unlimited" : p.userLimit} Users, {p.storageLimitGb === -1 ? "Unlimited" : p.storageLimitGb + " GB"} Storage)
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
                  </div>
                </div>

                {/* Selected Plan Details Preview Card */}
                {selectedPlan && (
                  <div className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3.5 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2D3436] text-sm">
                          {selectedPlan.name}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[#E8E2DE] text-[#6E6763]">
                          {selectedPlan.code}
                        </span>
                      </div>
                      <span className="font-bold text-[#5141F5] text-sm">
                        ${selectedPlan.monthlyPrice} / month
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[#6E6763] pt-1">
                      <div>
                        <strong className="text-[#3E3734]">User Limit:</strong>{" "}
                        {selectedPlan.userLimit === -1 ? "Unlimited" : `${selectedPlan.userLimit} Users`}
                      </div>
                      <div>
                        <strong className="text-[#3E3734]">Storage:</strong>{" "}
                        {selectedPlan.storageLimitGb === -1 ? "Unlimited" : `${selectedPlan.storageLimitGb} GB`}
                      </div>
                    </div>

                    {Array.isArray(selectedPlan.features) && selectedPlan.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {selectedPlan.features.map((feat, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-[#E8E2DE] px-2 py-0.5 rounded text-[10px] text-[#6E6763]"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Start Date & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#3E3734] mb-1.5 flex items-center gap-1.5">
                      <FiCalendar className="text-[#817B77]" />
                      <span>Start Date <span className="text-[#C62828]">*</span></span>
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3E3734] mb-1.5 flex items-center gap-1.5">
                      <FiClock className="text-[#817B77]" />
                      <span>Duration (Months) <span className="text-[#C62828]">*</span></span>
                    </label>
                    <div className="relative">
                      <select
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(Number(e.target.value))}
                        className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors appearance-none cursor-pointer pr-10"
                      >
                        <option value={1}>1 Month</option>
                        <option value={3}>3 Months (Quarterly)</option>
                        <option value={6}>6 Months (Semi-annual)</option>
                        <option value={12}>12 Months (Annual)</option>
                      </select>
                      <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Expiry / Renewal Date Live Preview */}
                <div className="bg-[#F8F7FF] border border-[#5141F5]/20 rounded-xl p-3 flex items-center justify-between text-xs">
                  <span className="text-[#6E6763] font-medium">Calculated Expiry / Renewal Date:</span>
                  <span className="font-bold text-[#5141F5] text-xs">
                    {expiryDatePreview ? formatDisplayDate(expiryDatePreview) : "—"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-white hover:bg-[#F2EBE5] text-[#6E6763] hover:text-[#3E3734] border border-[#E8E2DE] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <FiX className="text-xs" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#8A817C] hover:bg-[#6E6763] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <FiPlus className="text-xs" />
              <span>{isSubmitting ? "Adding..." : "Add Vendor"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendorModal;
