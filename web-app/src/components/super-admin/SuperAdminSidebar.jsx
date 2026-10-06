import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import fieldCamLogo from "../../assets/fieldCamLogo.png";
import {
  FiGrid,
  FiBriefcase,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
} from "react-icons/fi";

const SuperAdminSidebar = ({
  collapsed: propCollapsed,
  setCollapsed: propSetCollapsed,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const collapsed =
    propCollapsed !== undefined ? propCollapsed : internalCollapsed;
  const setCollapsed = propSetCollapsed || setInternalCollapsed;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: FiGrid,
      path: "/super-admin/dashboard",
    },
    {
      id: "companies",
      label: "Companies",
      icon: FiBriefcase,
      path: "/super-admin/companies",
    },
    {
      id: "subscriptions",
      label: "Subscriptions",
      icon: FiFileText,
      path: "/super-admin/subscriptions",
    },
    {
      id: "settings",
      label: "System Settings",
      icon: FiSettings,
      path: "/super-admin/settings",
    },
  ];

  const adminName = user?.name || user?.email?.split("@")[0] || "Super Admin";
  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-[#EBE6E3] flex flex-col justify-between transition-all duration-300 ${
        collapsed ? "w-16" : "w-[220px]"
      } h-screen py-6 px-4 overflow-y-auto hidden lg:flex shrink-0 shadow-xs`}
    >
      <div>
        {/* Logo */}
        <div
          className={`flex items-center justify-start mb-8 ${
            collapsed ? "px-0 justify-center" : "px-1"
          }`}
        >
          <Link
            to="/super-admin/dashboard"
            className="flex items-center gap-2 overflow-hidden"
          >
            <img
              src={fieldCamLogo}
              alt="FieldCam"
              className={`object-contain transition-all duration-300 ${
                collapsed ? "w-9 h-9" : "w-[140px] h-auto"
              }`}
            />
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/super-admin" && location.pathname.startsWith(`${item.path}/`)) ||
              (item.id === "dashboard" &&
                (location.pathname === "/super-admin/dashboard" ||
                  location.pathname === "/super-admin"));

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.path && item.path !== "#") {
                    navigate(item.path);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#817B77] text-white font-semibold shadow-xs"
                    : "text-[#6E6763] hover:bg-[#F5F2F0] hover:text-[#2D3436]"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="text-base shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="space-y-3 pt-4 border-t border-[#EBE6E3]">
        {/* System Status Banner */}
        {!collapsed && (
          <div className="rounded-xl bg-[#F8F7FF] border border-[#EBE6E3] p-3 text-left">
            <p className="text-[9px] font-bold text-[#817B77] tracking-wider uppercase mb-1">
              System Status
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
              <span className="text-[11px] font-bold text-[#2D3436]">
                All systems operational
              </span>
            </div>
          </div>
        )}

        {/* Logged in Super Admin Identity Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F5] border border-[#EBE6E3]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#5141F5] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {initials || <FiShield />}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block text-xs font-bold text-[#2D3436] truncate">
                  {adminName}
                </span>
                <span className="block text-[10px] text-[#817B77] truncate">
                  {user?.email || "Super Admin"}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="text-[#817B77] hover:text-[#DC2626] p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
              title="Logout"
            >
              <FiLogOut className="text-sm" />
            </button>
          )}
        </div>

        {/* Collapse Toggle */}
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-[#817B77] hover:text-[#2D3436] hover:bg-[#F5F2F0] rounded-lg transition-colors cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
