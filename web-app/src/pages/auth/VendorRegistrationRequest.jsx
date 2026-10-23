import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiUser,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLayers,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiArrowLeft,
  FiShield,
} from "react-icons/fi";
import { submitVendorRegistration } from "../../services/vendorRegistrationService";
import workerImage from "../../assets/workerImage.jpg";

const DEFAULT_SERVICES = [
  "Site Inspection",
  "Photo Auditing",
  "Structural Survey",
  "Drone & Aerial Inspection",
  "HVAC & Equipment Check",
  "Plumbing & Piping Inspection",
  "Thermal Imaging",
];

const VendorRegistrationRequest = () => {
  const navigate = useNavigate();

  // Form Fields
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [servicesInput, setServicesInput] = useState("Site Inspection");
  const [description, setDescription] = useState("");

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleSelectServicePreset = (service) => {
    const current = servicesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (current.includes(service)) {
      setServicesInput(current.filter((s) => s !== service).join(", "));
    } else {
      setServicesInput([...current, service].join(", "));
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Required Field Validations
    if (!contactName.trim()) {
      setError("Please enter the contact person's full name.");
      return;
    }
    if (contactName.trim().length < 2) {
      setError("Contact name must be at least 2 characters.");
      return;
    }
    if (!companyName.trim()) {
      setError("Please enter your company or business name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your business email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please provide a valid business email address.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter a contact phone number.");
      return;
    }
    const cleanedPhone = phone.trim().replace(/[\s\-\(\)\.]/g, "");
    if (cleanedPhone.length < 7) {
      setError("Please enter a valid phone number with at least 7 digits.");
      return;
    }
    if (!location.trim()) {
      setError("Please enter your business operating address or location.");
      return;
    }

    const servicesList = servicesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (servicesList.length === 0) {
      setError("Please specify at least one service offered.");
      return;
    }

    const payload = {
      contactName: contactName.trim(),
      companyName: companyName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      location: location.trim(),
      services: servicesList,
      description: description.trim(),
    };

    try {
      setIsSubmitting(true);
      await submitVendorRegistration(payload);
      setSubmittedData(payload);
      setIsSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit vendor registration request. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex">
      {/* Left Column: FieldCam Hero (hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img
          src={workerImage}
          alt="Field worker"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-between w-full px-14 py-14 text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-tight">FieldCam</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white/80">
              Vendor Onboarding
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
              Partner with FieldCam.
              <br />
              <span className="text-[#8B7CFF]">Grow Your Field Operations.</span>
            </h1>

            <p className="text-white/80 text-sm leading-6 max-w-lg">
              Join our network of verified inspection vendors. Submit your registration request
              to get reviewed and onboarded by FieldCam administrative operations.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15">
              <div>
                <p className="text-xl font-bold">100%</p>
                <p className="text-xs text-white/70 mt-0.5">Administrative Quality Review</p>
              </div>
              <div>
                <p className="text-xl font-bold">Fast-Track</p>
                <p className="text-xs text-white/70 mt-0.5">Secure OTP Account Activation</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/50">
            &copy; 2026 FieldCam Platform. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Column: Registration Form / Success Confirmation */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 overflow-y-auto min-h-screen">
        <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6 sm:p-8 my-6">
          {/* Back to Login link */}
          <div className="mb-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#817B77] hover:text-[#5141F5] font-medium transition-colors"
            >
              <FiArrowLeft className="text-sm" />
              <span>Back to Login</span>
            </Link>
          </div>

          {isSuccess ? (
            /* Success Confirmation State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto shadow-sm">
                <FiCheckCircle className="text-3xl" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#171717]">
                  Request Submitted Successfully!
                </h2>
                <p className="text-xs text-[#817B77]">
                  Your vendor registration request is now pending administrative review.
                </p>
              </div>

              {submittedData && (
                <div className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-4 text-left text-xs space-y-2 mt-4">
                  <div className="flex justify-between border-b border-[#E8E2DE] pb-2">
                    <span className="text-[#817B77]">Company:</span>
                    <span className="font-semibold text-[#3E3734]">{submittedData.companyName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8E2DE] pb-2">
                    <span className="text-[#817B77]">Contact:</span>
                    <span className="font-semibold text-[#3E3734]">{submittedData.contactName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E8E2DE] pb-2">
                    <span className="text-[#817B77]">Email:</span>
                    <span className="font-semibold text-[#3E3734]">{submittedData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#817B77]">Location:</span>
                    <span className="font-semibold text-[#3E3734]">{submittedData.location}</span>
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-[#F1F3FC] border border-[#E3E6F2] p-3 text-left">
                <p className="text-[11px] font-semibold text-[#5141F5] mb-1">What happens next?</p>
                <p className="text-[11px] text-[#6565E8] leading-4">
                  Our administrators will review your application details. Once approved, you will receive an invitation email at your registered business email with a secure OTP to complete your profile setup.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full h-[40px] rounded-xl bg-[#5141F5] hover:bg-[#4535E8] text-white text-xs font-semibold shadow-[0_5px_12px_rgba(81,65,245,0.28)] transition"
              >
                Return to Login
              </button>
            </div>
          ) : (
            /* Registration Request Form */
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF0FF] flex items-center justify-center">
                    <FiBriefcase className="text-[#5141F5] text-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#171717] leading-tight">
                      Vendor Registration Request
                    </h2>
                    <p className="text-[11px] text-[#8A8A8A] mt-0.5">
                      Submit your business details for administrative approval
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2">
                  <FiAlertCircle className="text-base shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Contact Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#202020] mb-1">
                    Contact Person's Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA9C2] text-sm" />
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => {
                        setContactName(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="e.g. Sarah Jenkins"
                      disabled={isSubmitting}
                      className="w-full h-[36px] rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-3 text-xs text-[#333] placeholder:text-[#A9B7CB] outline-none transition focus:border-[#5141F5] focus:ring-1 focus:ring-[#5141F5]/10"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#202020] mb-1">
                    Company / Business Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA9C2] text-sm" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="e.g. Apex Field Services LLC"
                      disabled={isSubmitting}
                      className="w-full h-[36px] rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-3 text-xs text-[#333] placeholder:text-[#A9B7CB] outline-none transition focus:border-[#5141F5] focus:ring-1 focus:ring-[#5141F5]/10"
                    />
                  </div>
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#202020] mb-1">
                      Business Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA9C2] text-sm" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="sarah@apex.com"
                        disabled={isSubmitting}
                        className="w-full h-[36px] rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-3 text-xs text-[#333] placeholder:text-[#A9B7CB] outline-none transition focus:border-[#5141F5] focus:ring-1 focus:ring-[#5141F5]/10"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#202020] mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA9C2] text-sm" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="+1 (555) 000-0000"
                        disabled={isSubmitting}
                        className="w-full h-[36px] rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-3 text-xs text-[#333] placeholder:text-[#A9B7CB] outline-none transition focus:border-[#5141F5] focus:ring-1 focus:ring-[#5141F5]/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Address / Location */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#202020] mb-1">
                    Business Address or Operating Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA9C2] text-sm" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="City, State, or Full Address"
                      disabled={isSubmitting}
                      className="w-full h-[36px] rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-3 text-xs text-[#333] placeholder:text-[#A9B7CB] outline-none transition focus:border-[#5141F5] focus:ring-1 focus:ring-[#5141F5]/10"
                    />
                  </div>
                </div>

                {/* Services Offered */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#202020] mb-1">
                    Services Offered <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA9C2] text-sm" />
                    <input
                      type="text"
                      value={servicesInput}
                      onChange={(e) => {
                        setServicesInput(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Comma-separated: Site Inspection, Drone Survey, etc."
                      disabled={isSubmitting}
                      className="w-full h-[36px] rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-3 text-xs text-[#333] placeholder:text-[#A9B7CB] outline-none transition focus:border-[#5141F5] focus:ring-1 focus:ring-[#5141F5]/10"
                    />
                  </div>

                  {/* Quick Select Presets */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {DEFAULT_SERVICES.map((preset) => {
                      const isSelected = servicesInput
                        .split(",")
                        .map((s) => s.trim())
                        .includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleSelectServicePreset(preset)}
                          className={`text-[10px] px-2.5 py-1 rounded-full transition-colors border ${
                            isSelected
                              ? "bg-[#EEF0FF] text-[#5141F5] border-[#5141F5]/30 font-semibold"
                              : "bg-white text-[#817B77] border-[#E5E7EB] hover:bg-[#F7F8FA]"
                          }`}
                        >
                          {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Company Description (Optional) */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#202020] mb-1">
                    Company Description <span className="text-xs text-[#A39A94] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-2.5 text-[#9AA9C2] text-sm" />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe your company, years in operation, team size, equipment, etc."
                      rows={2}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-3 py-2 text-xs text-[#333] placeholder:text-[#A9B7CB] outline-none transition focus:border-[#5141F5] focus:ring-1 focus:ring-[#5141F5]/10 resize-none"
                    />
                  </div>
                </div>

                {/* Security Note */}
                <div className="rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] p-2.5 flex items-start gap-2">
                  <FiShield className="text-[#5141F5] text-xs shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#817B77] leading-3.5">
                    Submitting this form does not create an active login session or account. All vendor partners undergo administrator verification prior to onboarding.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[38px] rounded-xl bg-[#5141F5] hover:bg-[#4535E8] text-white text-xs font-semibold shadow-[0_5px_12px_rgba(81,65,245,0.28)] transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="animate-spin text-sm" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <span>Submit Registration Request</span>
                  )}
                </button>
              </form>

              {/* Already have an account */}
              <div className="text-center pt-3 mt-1 border-t border-[#ECECEC]">
                <span className="text-[11px] text-[#858585]">Already registered? </span>
                <Link
                  to="/login"
                  className="text-[11px] text-[#5141F5] font-semibold hover:underline"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorRegistrationRequest;
