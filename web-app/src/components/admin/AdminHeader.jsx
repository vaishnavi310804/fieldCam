import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiBell, FiChevronDown, FiLogOut, FiUser, FiSearch } from "react-icons/fi";

const AdminHeader = ({ title = "Dashboard", subtitle, showSearch = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const displayName = user?.name || "Sarah K.";
  const defaultSubtitle = `Welcome back, ${displayName.split(" ")[0]}. Here's what's happening today.`;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-[#F7F4F2] border-b border-[#E8E2DE] px-6 py-2 flex items-center justify-between">
      {/* Header Title & Subtitle */}
      <div>
        <h1 className="text-xl font-bold text-[#3E3734]">{title}</h1>
        <p className="text-xs text-[#817B77] mt-0.5">
          {subtitle || defaultSubtitle}
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Optional Search Input */}
        {showSearch && (
          <div className="relative hidden md:block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-white border border-[#EAE4DF] rounded-2xl pl-8 pr-4 py-1.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors w-40 lg:w-48"
            />
          </div>
        )}

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-full bg-white border border-[#EAE4DF] text-[#6E6763] hover:text-[#3E3734] hover:bg-[#F2EBE5] transition-colors"
          aria-label="Notifications"
        >
          <FiBell className="text-base" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#E07A5F] rounded-full"></span>
        </button>

        {/* Profile Area */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 bg-white border border-[#EAE4DF] rounded-2xl px-3 py-1.5 hover:bg-[#F2EBE5] transition-colors"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#D4A373] text-white flex items-center justify-center font-bold text-xs">
                {displayName.charAt(0)}
              </div>
            )}

            <span className="text-xs font-semibold text-[#3E3734]">
              {displayName}
            </span>
            <FiChevronDown className="text-xs text-[#817B77]" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E8E2DE] rounded-2xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-[#F2EBE5]">
                <p className="text-xs font-bold text-[#3E3734]">{displayName}</p>
                <p className="text-[11px] text-[#817B77] truncate">
                  {user?.email || "admin@fieldcam.com"}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-[#4A423F] hover:bg-[#F7F4F2] flex items-center gap-2"
              >
                <FiUser className="text-sm text-[#817B77]" />
                <span>Profile Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <FiLogOut className="text-sm" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
