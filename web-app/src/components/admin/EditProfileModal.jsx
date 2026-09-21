import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/authService";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiBriefcase,
  FiLayers,
  FiCheck,
  FiAlertCircle,
  FiLinkedin,
  FiTwitter,
  FiGithub,
  FiLink,
} from "react-icons/fi";

const TIMEZONE_OPTIONS = [
  "",
  "UTC",
  "America/New_York (EST/EDT)",
  "America/Chicago (CST/CDT)",
  "America/Denver (MST/MDT)",
  "America/Los_Angeles (PST/PDT)",
  "Europe/London (GMT/BST)",
  "Asia/Kolkata (IST)",
  "Asia/Singapore (SGT)",
  "Australia/Sydney (AEST)",
];

const DEPARTMENT_OPTIONS = [
  "",
  "Field Operations",
  "Management",
  "Engineering",
  "Quality Assurance",
  "Finance",
  "Vendor Relations",
  "Support",
];

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "",
    twitter: "",
    github: "",
    website: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form from authenticated user ONLY when modal opens (isOpen becomes true)
  useEffect(() => {
    if (isOpen && user) {
      // Derive initial firstName & lastName from user.firstName/lastName or fallback to user.name
      let initFirstName = user.firstName || "";
      let initLastName = user.lastName || "";

      if (!initFirstName && !initLastName && user.name) {
        const parts = user.name.trim().split(" ");
        initFirstName = parts[0] || "";
        initLastName = parts.slice(1).join(" ") || "";
      }

      setFirstName(initFirstName);
      setLastName(initLastName);
      setPhone(user.phone || "");
      setLocation(user.location || "");
      setTimezone(user.timezone || "");
      setTitle(user.title || "");
      setDepartment(user.department || "");
      setBio(user.bio || "");
      setSocialLinks({
        linkedin: user.socialLinks?.linkedin || "",
        twitter: user.socialLinks?.twitter || "",
        github: user.socialLinks?.github || "",
        website: user.socialLinks?.website || "",
      });

      setError("");
      setIsSubmitting(false);
      setActiveTab("personal");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  const handleSocialChange = (key, value) => {
    setSocialLinks((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side Validation
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName) {
      setError("First Name is required.");
      return;
    }
    if (trimmedFirstName.length < 2 || trimmedFirstName.length > 50) {
      setError("First Name must be between 2 and 50 characters.");
      return;
    }

    if (!trimmedLastName) {
      setError("Last Name is required.");
      return;
    }
    if (trimmedLastName.length < 2 || trimmedLastName.length > 50) {
      setError("Last Name must be between 2 and 50 characters.");
      return;
    }

    if (bio.length > 500) {
      setError("Bio cannot exceed 500 characters.");
      return;
    }

    setIsSubmitting(true);

    // Build payload ONLY with allowed update fields
    const payload = {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      phone: phone.trim(),
      location: location.trim(),
      timezone: timezone.trim(),
      title: title.trim(),
      department: department.trim(),
      bio: bio.trim(),
      socialLinks: {
        linkedin: socialLinks.linkedin.trim(),
        twitter: socialLinks.twitter.trim(),
        github: socialLinks.github.trim(),
        website: socialLinks.website.trim(),
      },
    };

    try {
      const res = await updateProfile(payload);
      if (res?.success && res?.data) {
        updateUser(res.data);
        onClose();
      } else {
        setError(res?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      const apiMessage =
        err.response?.data?.message || err.message || "Failed to update profile. Please try again.";
      setError(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF5F2] border border-[#E8E2DE] rounded-2xl w-full max-w-xl shadow-xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E8E2DE] bg-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#3E3734]">Edit Profile</h2>
            <p className="text-xs text-[#817B77] mt-0.5">
              Update your personal information and preferences.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#817B77] hover:text-[#3E3734] hover:bg-[#F2EBE5] rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <FiAlertCircle className="text-base shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Profile Photo Section (Display Only - Upload disabled for Step 3) */}
          <div className="bg-white border border-[#E8E2DE] rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={displayName}
                className="w-16 h-16 rounded-2xl object-cover border border-[#E8E2DE] shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#C8B5AC] text-white flex items-center justify-center font-bold text-xl border border-white shadow-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-[#3E3734]">Profile Photo</h3>
              <p className="text-[11px] text-[#817B77] mt-0.5">
                JPG or PNG. Max 5MB.
              </p>

              {/* Upload control disabled per Step 3 requirement */}
              <button
                type="button"
                disabled
                title="Photo upload functionality will be available in a separate update"
                className="text-xs font-semibold text-[#C8B5AC] cursor-not-allowed opacity-60 mt-1 inline-block"
              >
                Upload new photo
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-[#F2EBE5] p-1 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                activeTab === "personal"
                  ? "bg-white text-[#3E3734] shadow-xs"
                  : "text-[#817B77] hover:text-[#3E3734]"
              }`}
            >
              Personal
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("work")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                activeTab === "work"
                  ? "bg-white text-[#3E3734] shadow-xs"
                  : "text-[#817B77] hover:text-[#3E3734]"
              }`}
            >
              Work & Bio
            </button>
          </div>

          {/* Form */}
          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "personal" && (
              <div className="space-y-4">
                {/* 2-Column: First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#6E6763] uppercase tracking-wider mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        maxLength={50}
                        className="bg-white border border-[#EAE4DF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] focus:outline-none focus:border-[#C8B5AC] transition-colors w-full"
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#6E6763] uppercase tracking-wider mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        maxLength={50}
                        className="bg-white border border-[#EAE4DF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] focus:outline-none focus:border-[#C8B5AC] transition-colors w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address (Read-Only) */}
                <div>
                  <label className="block text-[11px] font-bold text-[#6E6763] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      readOnly
                      className="bg-[#F2EBE5]/60 border border-[#EAE4DF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#817B77] cursor-not-allowed w-full"
                    />
                  </div>
                  <p className="text-[10px] text-[#817B77] mt-1">
                    Email address cannot be changed directly. Contact administrator.
                  </p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-[11px] font-bold text-[#6E6763] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="bg-white border border-[#EAE4DF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] focus:outline-none focus:border-[#C8B5AC] transition-colors w-full"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[11px] font-bold text-[#6E6763] uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      className="bg-white border border-[#EAE4DF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] focus:outline-none focus:border-[#C8B5AC] transition-colors w-full"
                    />
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-[11px] font-bold text-[#6E6763] uppercase tracking-wider mb-1">
                    Timezone
                  </label>
                  <div className="relative">
                    <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="bg-white border border-[#EAE4DF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3734] focus:outline-none focus:border-[#C8B5AC] transition-colors w-full appearance-none"
                    >
                      <option value="">Select Timezone</option>
                      {TIMEZONE_OPTIONS.filter(Boolean).map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "work" && (
              <div className="space-y-4">
                {/* Job Title */}
                <div>
                  <label className="block text-[11px] font-bold text-[#6E6763] uppercase tracking-wider mb-1">
                    Job Title
                  </label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Operations Specialist"
                      className="bg-white border border-[#EAE4DF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] focus:outline-none focus:border-[#C8B5AC] transition-colors w-full"
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-[11px] font-bold text-[#6E6763] uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <FiLayers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Field Operations"
                      list="department-suggestions"
                      className="bg-white border border-[#EAE4DF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] focus:outline-none focus:border-[#C8B5AC] transition-colors w-full"
                    />
                    <datalist id="department-suggestions">
                      {DEPARTMENT_OPTIONS.filter(Boolean).map((dept) => (
                        <option key={dept} value={dept} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-[#6E6763] uppercase tracking-wider">
                      Bio
                    </label>
                    <span
                      className={`text-[10px] ${
                        bio.length > 500 ? "text-red-500 font-bold" : "text-[#817B77]"
                      }`}
                    >
                      {bio.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                    className="bg-white border border-[#EAE4DF] rounded-xl p-3 text-xs text-[#3E3734] placeholder-[#A39A94] focus:outline-none focus:border-[#C8B5AC] transition-colors w-full resize-none"
                  />
                </div>

                {/* Social Links Sub-Section */}
                <div className="pt-2 border-t border-[#E8E2DE]">
                  <h4 className="text-xs font-bold text-[#3E3734] mb-3">
                    Social Profiles
                  </h4>

                  <div className="space-y-3">
                    {/* LinkedIn */}
                    <div>
                      <label className="block text-[10px] font-semibold text-[#817B77] uppercase tracking-wider mb-1">
                        LinkedIn
                      </label>
                      <div className="relative">
                        <FiLinkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                        <input
                          type="url"
                          value={socialLinks.linkedin}
                          onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="bg-white border border-[#EAE4DF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] focus:outline-none focus:border-[#C8B5AC] transition-colors w-full"
                        />
                      </div>
                    </div>

                    {/* Twitter */}
                    <div>
                      <label className="block text-[10px] font-semibold text-[#817B77] uppercase tracking-wider mb-1">
                        Twitter / X
                      </label>
                      <div className="relative">
                        <FiTwitter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                        <input
                          type="url"
                          value={socialLinks.twitter}
                          onChange={(e) => handleSocialChange("twitter", e.target.value)}
                          placeholder="https://twitter.com/username"
                          className="bg-white border border-[#EAE4DF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] focus:outline-none focus:border-[#C8B5AC] transition-colors w-full"
                        />
                      </div>
                    </div>

                    {/* GitHub */}
                    <div>
                      <label className="block text-[10px] font-semibold text-[#817B77] uppercase tracking-wider mb-1">
                        GitHub
                      </label>
                      <div className="relative">
                        <FiGithub className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                        <input
                          type="url"
                          value={socialLinks.github}
                          onChange={(e) => handleSocialChange("github", e.target.value)}
                          placeholder="https://github.com/username"
                          className="bg-white border border-[#EAE4DF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] focus:outline-none focus:border-[#C8B5AC] transition-colors w-full"
                        />
                      </div>
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-[10px] font-semibold text-[#817B77] uppercase tracking-wider mb-1">
                        Personal Website
                      </label>
                      <div className="relative">
                        <FiLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                        <input
                          type="url"
                          value={socialLinks.website}
                          onChange={(e) => handleSocialChange("website", e.target.value)}
                          placeholder="https://yourwebsite.com"
                          className="bg-white border border-[#EAE4DF] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] focus:outline-none focus:border-[#C8B5AC] transition-colors w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#E8E2DE] bg-white flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white border border-[#E8E2DE] rounded-xl text-xs font-semibold text-[#3E3734] hover:bg-[#F7F4F2] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-profile-form"
            disabled={isSubmitting}
            className="px-5 py-2 bg-[#C8B5AC] hover:bg-[#B8A399] text-[#3E3734] rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <FiCheck className="text-sm" />
            <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
