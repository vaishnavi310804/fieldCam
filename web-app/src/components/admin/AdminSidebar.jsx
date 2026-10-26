import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiFolder,
  FiUsers,
  FiFileText,
  FiBarChart2,
  FiTool,
  FiHeadphones,
} from "react-icons/fi";
import fieldCamLogo from "../../assets/fieldCamLogo.png";
import { usePermissions } from "../../hooks/usePermissions";
import { ADMIN_NAV_MODULE_MAPPING } from "../../utils/permissions";

const ICON_MAP = {
  dashboard: FiGrid,
  projects: FiFolder,
  vendors: FiUsers,
  invoices: FiFileText,
  analytics: FiBarChart2,
  services: FiTool,
  support: FiHeadphones,
};

export const navItems = ADMIN_NAV_MODULE_MAPPING.map((item) => ({
  ...item,
  icon: ICON_MAP[item.id] || FiGrid,
}));

const AdminSidebar = ({
  collapsed: propCollapsed,
  setCollapsed: propSetCollapsed,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const collapsed =
    propCollapsed !== undefined ? propCollapsed : internalCollapsed;

  const setCollapsed = propSetCollapsed || setInternalCollapsed;
  const { canAccessModule } = usePermissions();

  const visibleNavItems = useMemo(
    () => navItems.filter((item) => canAccessModule(item.module)),
    [canAccessModule]
  );

  const logoDestination = useMemo(() => {
    if (visibleNavItems.some((item) => item.id === "dashboard")) {
      return "/admin/dashboard";
    }
    return visibleNavItems[0]?.path || "/admin/dashboard";
  }, [visibleNavItems]);

  const activeTab = location.pathname.startsWith("/admin/services")
    ? "services"
    : location.pathname.startsWith("/admin/support")
    ? "support"
    : location.pathname.startsWith("/admin/analytics")
    ? "analytics"
    : location.pathname.startsWith("/admin/invoices")
    ? "invoices"
    : location.pathname.startsWith("/admin/vendors")
    ? "vendors"
    : location.pathname.startsWith("/admin/projects")
    ? "projects"
    : location.pathname.startsWith("/admin/dashboard")
    ? "dashboard"
    : "dashboard";

  const handleNavClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 bg-[#F7F4F2] border-r border-[#E8E2DE] flex flex-col justify-between transition-all duration-300 ${
        collapsed ? "w-16" : "w-[170px]"
      } h-screen py-6 px-3 overflow-y-auto hidden lg:flex shrink-0`}
    >
      <div>
        {/* Logo */}
        <div
          className={`flex items-center justify-center mb-8 ${
            collapsed ? "px-0" : "px-2"
          }`}
        >
          <Link
            to={logoDestination}
            className="flex items-center gap-2 overflow-hidden"
          >
            <img
              src={fieldCamLogo}
              alt="FieldCam"
              className={`object-contain transition-all duration-300 ${
                collapsed ? "w-9 h-9" : "w-[150px] h-auto"
              }`}
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {visibleNavItems.length > 0 ? (
            visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#C8B5AC] text-[#3E3734] font-semibold shadow-sm"
                      : "text-[#817B77] hover:bg-[#EAE4DF] hover:text-[#4A423F]"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="text-base shrink-0" />

                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-4 text-center text-xs text-[#817B77]">
              {!collapsed && <span>No accessible modules</span>}
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;