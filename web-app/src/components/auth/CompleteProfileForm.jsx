import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { completeProfile } from "../../services/authService";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
} from "react-icons/fi";

const CompleteProfileForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [setupToken, setSetupToken] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const token = location.state?.setupToken || "";
    const email = location.state?.email || searchParams.get("email") || "";
    const name = location.state?.name || "";

    setSetupToken(token);
    setVendorEmail(email);
    setVendorName(name);
  }, [location.state, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!setupToken) {
      setError("Missing setup token. Please complete OTP verification first.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");

      const response = await completeProfile({
        setupToken,
        password,
      });

      const { user: userData, accessToken } = response.data;

      setSuccessMsg("Account activated! Logging you in...");

      login(userData, accessToken);

      setTimeout(() => {
        navigate("/vendor/dashboard", { replace: true });
      }, 800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to setup password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!setupToken) {
    return (
      <div className="w-full max-w-[395px] bg-white rounded-xl shadow px-7 py-7 sm:px-8 sm:py-8 text-center">
        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle size={22} />
        </div>

        <h2 className="text-base font-bold text-[#171717] mb-2">
          Verification Required
        </h2>

        <p className="text-[11px] text-[#777] mb-6 leading-relaxed">
          You must verify your email with the One-Time Password (OTP) before creating your password.
        </p>

        <button
          type="button"
          onClick={() => navigate("/vendor/verify-otp")}
          className="w-full h-[35px] rounded-[9px] bg-[#5141F5] hover:bg-[#4535E8] text-white text-[11px] font-semibold transition flex items-center justify-center gap-1.5"
        >
          Go to Verification
          <FiArrowRight size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[395px] bg-white rounded-xl shadow px-7 py-7 sm:px-8 sm:py-8">
      <div className="mb-7">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#EEF0FF] flex items-center justify-center">
            <FiLock
              size={13}
              strokeWidth={2}
              className="text-[#5141F5]"
            />
          </div>

          <h2 className="text-[17px] font-bold text-[#171717]">
            Set Password
          </h2>
        </div>

        <p className="text-[11px] text-[#8A8A8A] mt-2 leading-relaxed">
          Create a secure password to activate your Vendor account
          {vendorEmail ? ` for ${vendorEmail}` : ""}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-[11px] font-medium text-[#202020] mb-1.5"
          >
            New Password
          </label>

          <div className="relative">
            <FiLock
              size={14}
              strokeWidth={1.7}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA9C2]"
            />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              className="w-full h-[35px] rounded-[9px] border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-10 text-[11px] text-[#333] placeholder:text-[#A9B7CB] outline-none transition focus:border-[#5141F5] focus:ring-1 focus:ring-[#5141F5]/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA0B8] hover:text-[#5141F5] transition"
            >
              {showPassword ? (
                <FiEyeOff size={14} strokeWidth={1.7} />
              ) : (
                <FiEye size={14} strokeWidth={1.7} />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-[11px] font-medium text-[#202020] mb-1.5"
          >
            Confirm Password
          </label>

          <div className="relative">
            <FiLock
              size={14}
              strokeWidth={1.7}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA9C2]"
            />

            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              placeholder="Re-enter password"
              autoComplete="new-password"
              className="w-full h-[35px] rounded-[9px] border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-10 text-[11px] text-[#333] placeholder:text-[#A9B7CB] outline-none transition focus:border-[#5141F5] focus:ring-1 focus:ring-[#5141F5]/10"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA0B8] hover:text-[#5141F5] transition"
            >
              {showConfirmPassword ? (
                <FiEyeOff size={14} strokeWidth={1.7} />
              ) : (
                <FiEye size={14} strokeWidth={1.7} />
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-[11px] leading-4">
            {error}
          </p>
        )}

        {/* Success */}
        {successMsg && (
          <div className="flex items-center gap-1.5 text-emerald-600 text-[11px]">
            <FiCheckCircle size={13} className="flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !!successMsg}
          className="w-full h-[35px] rounded-[9px] bg-[#5141F5] hover:bg-[#4535E8] text-white text-[11px] font-semibold shadow-[0_5px_12px_rgba(81,65,245,0.28)] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          {loading ? "Activating Account..." : "Complete Setup & Sign In"}
        </button>

        {/* Security Notice */}
        <div className="rounded-[9px] bg-[#F1F3FC] border border-[#E3E6F2] px-3 py-3 mt-3">
          <div className="flex items-start gap-2">
            <FiShield
              size={13}
              strokeWidth={1.6}
              className="mt-0.5 flex-shrink-0 text-[#5B55F5]"
            />

            <p className="text-[9px] leading-[14px] text-[#6565E8]">
              Your password will be encrypted securely using bcrypt (salt 12) upon activation.
            </p>
          </div>
        </div>
      </form>

      <p className="text-center text-[9px] text-[#858585] mt-3">
        © 2026 FieldCam. All rights reserved.
      </p>
    </div>
  );
};

export default CompleteProfileForm;
