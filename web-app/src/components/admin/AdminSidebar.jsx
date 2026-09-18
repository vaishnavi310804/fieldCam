import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiFolder,
  FiUsers,
  FiFileText,
  FiBarChart2,
  FiTool,
  FiHeadphones,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import fieldCamLogo from "../../assets/fieldCamLogo.png";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: FiGrid, path: "/admin/dashboard" },
  { id: "projects", label: "Projects", icon: FiFolder, path: "/admin/projects" },
  { id: "vendors", label: "Vendors", icon: FiUsers, path: "/admin/vendors" },
  { id: "invoices", label: "Invoices", icon: FiFileText, path: "/admin/invoices" },
  { id: "analytics", label: "Analytics", icon: FiBarChart2, path: "/admin/analytics" },
  { id: "services", label: "Services", icon: FiTool, path: "/admin/services" },
  { id: "support", label: "Support", icon: FiHeadphones, path: "/admin/support" },
];

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
          <img
            src={fieldCamLogo}
            alt="FieldCam"
            className={`object-contain transition-all duration-300 ${
              collapsed ? "w-9 h-9" : "w-[150px] h-auto"
            }`}
          />
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
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
          })}
        </nav>
      </div>

      {/* Collapse Button */}
      <div className="pt-4 border-t border-[#E8E2DE]/60 flex justify-center">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-[#817B77] hover:text-[#3E3734] hover:bg-[#EAE4DF] rounded-lg transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;