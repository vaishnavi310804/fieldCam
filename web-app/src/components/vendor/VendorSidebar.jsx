import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import fieldCamLogo from "../../assets/fieldCamLogo.png";
import {
  FiGrid,
  FiBriefcase,
  FiFileText,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiHelpCircle,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const VendorSidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FiGrid, path: "/vendor/dashboard" },
    { id: "projects", label: "Projects", icon: FiBriefcase, path: "/vendor/projects" },
    { id: "invoices", label: "Invoices", icon: FiFileText, path: "/vendor/invoices" },
    { id: "earnings", label: "Earnings", icon: FiDollarSign, path: "#" },
    { id: "staff", label: "Staff", icon: FiUsers, path: "#" },
    { id: "performance", label: "Performance", icon: FiTrendingUp, path: "/vendor/performance" },
    { id: "support", label: "Support", icon: FiHelpCircle, path: "/admin/support" },
  ];

  const vendorName = user?.name || user?.email?.split("@")[0] || "Vendor Partner";
  const initials = vendorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-[#EEE9E6] border-r border-[#E8E2DE] transition-all duration-300 flex flex-col justify-between ${
        collapsed ? "w-16" : "w-[170px]"
      }`}
    >
      {/* Top Header Logo */}
      <div>
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#E8E2DE]">
          <Link to="/vendor/dashboard" className="flex items-center gap-2 overflow-hidden">
            <img
              src={fieldCamLogo}
              alt="FIELDcam"
              className="h-8 w-auto object-contain shrink-0"
            />
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg hover:bg-[#EAE4DF] transition-colors"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <FiChevronRight className="text-sm" />
            ) : (
              <FiChevronLeft className="text-sm" />
            )}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="p-2 space-y-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.id === "dashboard" && location.pathname === "/vendor/dashboard");

            return (
              <Link
                key={item.id}
                to={item.path !== "#" ? item.path : "#"}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#C8B5AC] text-[#3E3734] shadow-xs"
                    : "text-[#817B77] hover:bg-[#EAE4DF] hover:text-[#3E3734]"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="text-sm shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Logout Footer */}
      <div className="p-2 border-t border-[#E8E2DE]">
        <div className="flex items-center justify-between p-1.5 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#E07A5F] text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block text-[11px] font-bold text-[#3E3734] truncate">
                  {vendorName}
                </span>
                <span className="block text-[9px] font-semibold text-[#817B77] truncate uppercase">
                  Vendor Partner
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="text-[#817B77] hover:text-[#C62828] p-1 rounded-lg hover:bg-[#FFEBEE] transition-colors cursor-pointer shrink-0"
              title="Logout"
            >
              <FiLogOut className="text-xs" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default VendorSidebar;
