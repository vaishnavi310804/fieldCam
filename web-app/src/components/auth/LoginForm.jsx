import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";
import {
  FiLock,
  FiMail,
  FiEye,
  FiEyeOff,
  FiShield,
} from "react-icons/fi";

const LoginForm = () => {
  const navigate = useNavigate();
  const { user, login, logout, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated && user?.role) {
    switch (user.role) {
      case "SUPER_ADMIN":
        return <Navigate to="/super-admin/dashboard" replace />;

      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;

      case "VENDOR":
        return <Navigate to="/vendor/dashboard" replace />;

      default:
        break;
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await loginUser(formData);

      const { user: userData, accessToken } = response.data.data;

      login(userData, accessToken);

      switch (userData.role) {
        case "SUPER_ADMIN":
          navigate("/super-admin/dashboard", { replace: true });
          break;

        case "ADMIN":
          navigate("/admin/dashboard", { replace: true });
          break;

        case "VENDOR":
          navigate("/vendor/dashboard", { replace: true });
          break;

        default:
          logout();
          setError(
            "You are not authorized to access the web application."
          );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again."
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
            <FiLock
              size={13}
              strokeWidth={2}
              className="text-[#5141F5]"
            />
          </div>

          <h2 className="text-[17px] font-bold text-[#171717]">
            Login
          </h2>
        </div>

        <p className="text-[11px] text-[#8A8A8A] mt-2">
          Sign in to your dashboard
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
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@fieldworkcam.com"
              autoComplete="email"
              className="w-full h-[35px] rounded-[9px] border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-3 text-[11px] text-[#333] placeholder:text-[#A9B7CB] outline-none transition focus:border-[#5141F5] focus:ring-1 focus:ring-[#5141F5]/10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-[11px] font-medium text-[#202020] mb-1.5"
          >
            Password
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
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full h-[35px] rounded-[9px] border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-10 text-[11px] text-[#333] placeholder:text-[#A9B7CB] outline-none transition focus:border-[#5141F5] focus:ring-1 focus:ring-[#5141F5]/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
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

        {/* Error */}
        {error && (
          <p className="text-red-500 text-[11px] leading-4">
            {error}
          </p>
        )}

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 text-[10px] text-[#858585] cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3 rounded border-[#D8DCE5] accent-[#5141F5]"
            />
            Remember me
          </label>

          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-[10px] text-[#5141F5] font-medium hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[35px] rounded-[9px] bg-[#5141F5] hover:bg-[#4535E8] text-white text-[11px] font-semibold shadow-[0_5px_12px_rgba(81,65,245,0.28)] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {/* Secured Access */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex-1 h-px bg-[#ECECEC]" />

          <span className="text-[8px] font-medium text-[#777] whitespace-nowrap">
            SECURED ACCESS
          </span>

          <div className="flex-1 h-px bg-[#ECECEC]" />
        </div>

        {/* Security Notice */}
        <div className="rounded-[9px] bg-[#F1F3FC] border border-[#E3E6F2] px-3 py-3">
          <div className="flex items-start gap-2">
            <FiShield
              size={13}
              strokeWidth={1.6}
              className="mt-0.5 flex-shrink-0 text-[#5B55F5]"
            />

            <p className="text-[9px] leading-[14px] text-[#6565E8]">
              This portal is restricted.
              <br />
              All login activity is monitored and logged.
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

export default LoginForm;