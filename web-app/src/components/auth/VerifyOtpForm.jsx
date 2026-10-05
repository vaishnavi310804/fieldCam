import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { verifyRegistrationOTP } from "../../services/authService";
import {
  FiMail,
  FiKey,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

const VerifyOtpForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const initialEmail =
      location.state?.email || searchParams.get("email") || "";
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [location.state, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!trimmedOtp) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (trimmedOtp.length !== 6 || !/^\d+$/.test(trimmedOtp)) {
      setError("OTP must be exactly 6 numeric digits.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");

      const response = await verifyRegistrationOTP({
        email: trimmedEmail,
        otp: trimmedOtp,
      });

      const { user: verifiedUser, setupToken } = response.data;
      setSuccessMsg("Email verified successfully! Redirecting to password setup...");

      setTimeout(() => {
        navigate("/complete-profile", {
          state: {
            setupToken,
            email: verifiedUser?.email,
            name: verifiedUser?.name,
          },
          replace: true,
        });
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[395px] bg-white rounded-xl shadow px-7 py-7 sm:px-8 sm:py-8">
      <div className="mb-7">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#EEF0FF] flex items-center justify-center">
            <FiKey
              size={13}
              strokeWidth={2}
              className="text-[#5141F5]"
            />
          </div>

          <h2 className="text-[17px] font-bold text-[#171717]">
            Verify Account
          </h2>
        </div>

        <p className="text-[11px] text-[#8A8A8A] mt-2 leading-relaxed">
          Enter the 6-digit OTP sent to your email address to complete verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-[11px] font-medium text-[#202020] mb-1.5"
          >
            Email Address
          </label>

          <div className="relative">
            <FiMail
              size={14}
              strokeWidth={1.7}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA9C2]"
            />

            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="user@example.com"
              autoComplete="email"
              className="w-full h-[35px] rounded-[9px] border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-3 text-[11px] text-[#333] placeholder:text-[#A9B7CB] outline-none transition focus:border-[#5141F5] focus:ring-1 focus:ring-[#5141F5]/10"
            />
          </div>
        </div>

        {/* OTP Input */}
        <div>
          <label
            htmlFor="otp"
            className="block text-[11px] font-medium text-[#202020] mb-1.5"
          >
            One-Time Password (OTP)
          </label>

          <div className="relative">
            <FiKey
              size={14}
              strokeWidth={1.7}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA9C2]"
            />

            <input
              id="otp"
              type="text"
              name="otp"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setError("");
              }}
              placeholder="Enter 6-digit OTP"
              className="w-full h-[35px] rounded-[9px] border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-3 text-[11px] text-[#333] placeholder:text-[#A9B7CB] outline-none transition focus:border-[#5141F5] focus:ring-1 focus:ring-[#5141F5]/10 tracking-widest font-mono"
            />
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

        {/* Verify Button */}
        <button
          type="submit"
          disabled={loading || !!successMsg}
          className="w-full h-[35px] rounded-[9px] bg-[#5141F5] hover:bg-[#4535E8] text-white text-[11px] font-semibold shadow-[0_5px_12px_rgba(81,65,245,0.28)] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          {loading ? (
            "Verifying OTP..."
          ) : (
            <>
              Verify OTP
              <FiArrowRight size={13} />
            </>
          )}
        </button>

        {/* Navigation to Login */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[10px] text-[#5141F5] font-medium hover:underline"
          >
            Back to Sign In
          </button>
        </div>

        {/* Security Notice */}
        <div className="rounded-[9px] bg-[#F1F3FC] border border-[#E3E6F2] px-3 py-3 mt-3">
          <div className="flex items-start gap-2">
            <FiShield
              size={13}
              strokeWidth={1.6}
              className="mt-0.5 flex-shrink-0 text-[#5B55F5]"
            />

            <p className="text-[9px] leading-[14px] text-[#6565E8]">
              OTP was dispatched to your registered email address upon account creation.
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

export default VerifyOtpForm;
