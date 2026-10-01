import { useState, useEffect } from "react";
import { FiX, FiPlus, FiAlertCircle, FiChevronDown } from "react-icons/fi";

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

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError("");
    };

    resetForm();
  }, [isOpen]);

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
                  placeholder="e.g., Apex Field Co."
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
                  placeholder="+91 Phone Number"
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
                placeholder="e.g., Austin, TX"
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
                Initial Rating (0 - 5)
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
