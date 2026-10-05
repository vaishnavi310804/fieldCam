import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import fieldCamLogo from "../../assets/fieldCamLogo.png";
import {
  FiGrid,
  FiBriefcase,
  FiLogOut,
} from "react-icons/fi";

const StaffSidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: FiGrid,
      path: "/staff/dashboard",
    },
    {
      id: "projects",
      label: "Projects",
      icon: FiBriefcase,
      path: "/staff/projects",
    },
  ];

  const staffName =
    user?.name || user?.email?.split("@")[0] || "Staff Member";
  const initials = staffName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 bg-[#F7F4F2] border-r border-[#E8E2DE] flex flex-col justify-between transition-all duration-300 ${
        collapsed ? "w-16" : "w-[170px]"
      } h-screen py-6 px-3 overflow-y-auto hidden lg:flex shrink-0`}
    >
      {/* Top Header Logo */}
      <div>
        <div
          className={`flex items-center justify-center mb-8 ${
            collapsed ? "px-0" : "px-2"
          }`}
        >
          <Link
            to="/staff/dashboard"
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

        {/* Menu Navigation - ONLY Dashboard & Projects */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.id === "dashboard" &&
                location.pathname === "/staff/dashboard");

            return (
              <Link
                key={item.id}
                to={item.path}
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
            <div className="w-7 h-7 rounded-full bg-[#5141F5] text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block text-[11px] font-bold text-[#3E3734] truncate">
                  {staffName}
                </span>
                <span className="block text-[9px] font-semibold text-[#817B77] truncate uppercase">
                  Field Staff
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

export default StaffSidebar;
