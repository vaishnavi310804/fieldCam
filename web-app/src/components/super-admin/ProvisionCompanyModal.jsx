import { useState } from "react";
import { FiX, FiPlus, FiBriefcase, FiMail, FiUser, FiPhone, FiMapPin } from "react-icons/fi";
import { createCompany } from "../../services/companyService";

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
