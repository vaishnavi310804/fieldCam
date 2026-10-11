import { useState } from "react";
import {
  FiX,
  FiAlertCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLock,
} from "react-icons/fi";

const AddStaffModal = ({ isOpen, onClose, onAddStaff }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setName("");
    setEmail("");
    setPhone("");
    setLocation("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (!name.trim()) {
      setError("Please enter the staff member's full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter a contact phone number.");
      return;
    }
    if (!location.trim()) {
      setError("Please enter a location.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddStaff({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        location: location.trim(),
      });
      handleClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create staff member. Please verify the information."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white border border-[#E8E2DE] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-4 border-b border-[#F0ECE9]">
          <div>
            <h2 className="text-xl font-bold text-[#3E3734]">
              Add New Staff Member
            </h2>
            <p className="text-xs text-[#817B77] mt-1">
              Fill in the details to add a new team member
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-[#817B77] hover:text-[#3E3734] hover:bg-[#FAF7F5] transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <FiX size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
            <FiAlertCircle className="shrink-0 text-sm" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <FiUser className="text-[#817B77]" size={16} />
              <h3 className="text-sm font-semibold text-[#3E3734]">
                Personal Information
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3E3734] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Smith"
                disabled={isSubmitting}
                className="w-full bg-white border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#3E3734] outline-none focus:border-[#C87A65] focus:ring-1 focus:ring-[#C87A65] transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3E3734] mb-1.5">
                Role *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value="Staff"
                  disabled
                  readOnly
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#817B77] font-medium outline-none cursor-not-allowed select-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-[#817B77] bg-[#F0ECE9] px-2 py-0.5 rounded-md font-medium">
                  <FiLock size={10} />
                  <span>Fixed Role</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-center gap-2">
              <FiMail className="text-[#817B77]" size={16} />
              <h3 className="text-sm font-semibold text-[#3E3734]">
                Contact Information
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3E3734] mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.smith@fieldworkcam.co"
                disabled={isSubmitting}
                className="w-full bg-white border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#3E3734] outline-none focus:border-[#C87A65] focus:ring-1 focus:ring-[#C87A65] transition-all disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#3E3734] mb-1.5">
                  <FiPhone size={12} className="text-[#817B77]" />
                  <span>Phone Number *</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  disabled={isSubmitting}
                  className="w-full bg-white border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#3E3734] outline-none focus:border-[#C87A65] focus:ring-1 focus:ring-[#C87A65] transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#3E3734] mb-1.5">
                  <FiMapPin size={12} className="text-[#817B77]" />
                  <span>Location *</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Austin, TX"
                  disabled={isSubmitting}
                  className="w-full bg-white border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#3E3734] outline-none focus:border-[#C87A65] focus:ring-1 focus:ring-[#C87A65] transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[#F0ECE9]">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#E8E2DE] bg-white text-xs sm:text-sm font-bold text-[#3E3734] hover:bg-[#FAF7F5] transition-colors cursor-pointer text-center disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D7A79A] to-[#C87A65] hover:from-[#C87A65] hover:to-[#B36854] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer text-center disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Staff Member</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
