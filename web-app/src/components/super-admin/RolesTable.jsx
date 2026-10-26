import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiShield,
  FiUsers,
  FiLock,
  FiCheck,
} from "react-icons/fi";
import { PERMISSION_MODULES } from "../../utils/permissions.js";

const formatActivityTime = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const MODULE_DISPLAY_NAMES = {
  DASHBOARD: "Dashboard",
  PROJECTS: "Projects",
  VENDORS: "Vendors",
  INVOICES: "Invoices",
  ANALYTICS: "Analytics",
  SERVICES: "Services",
  SUPPORT: "Support",
};

const TOTAL_KNOWN_MODULES = Object.keys(PERMISSION_MODULES).length;

const RolesTable = ({
  roles = [],
  loading = false,
  onViewRole = () => {},
  onEditRole = () => {},
  onDeleteRole = () => {},
}) => {
  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#817B77] flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#817B77] border-t-transparent rounded-full animate-spin" />
            <span>Loading platform roles...</span>
          </div>
        ) : !roles || roles.length === 0 ? (
          <div className="p-12 text-center text-[#817B77]">
            <FiShield className="text-3xl mx-auto mb-2 text-[#A39A94]" />
            <p className="text-xs font-bold text-[#2D3436]">No roles found</p>
            <p className="text-[11px] text-[#A39A94] mt-0.5">
              Try adjusting your search criteria or create a new custom role.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F5] border-b border-[#EBE6E3] text-[10px] font-bold text-[#817B77] uppercase tracking-wider">
                <th className="py-3.5 px-6">Role Name & Type</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6">Permitted Modules</th>
                <th className="py-3.5 px-6 text-center">Assigned Admins</th>
                <th className="py-3.5 px-6">Last Updated</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F2EBE5] text-xs">
              {roles.map((role) => {
                const isSystem = Boolean(role.isSystem);
                const assignedCount = Number(role.userCount) || 0;
                const permissionsList = Array.isArray(role.permissions)
                  ? role.permissions
                  : [];
                const activeModules = permissionsList
                  .filter((p) => Array.isArray(p.actions) && p.actions.length > 0)
                  .map((p) => p.module);
                const isAllModules =
                  activeModules.length >= TOTAL_KNOWN_MODULES;

                return (
                  <tr
                    key={role._id}
                    className="hover:bg-[#FAF7F5]/60 transition-colors group"
                  >
                    {/* Role Name & Type */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                            isSystem
                              ? "bg-purple-100 text-purple-700"
                              : "bg-[#F5F2F0] text-[#6E6763]"
                          }`}
                        >
                          <FiShield className="text-sm" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[#2D3436] text-xs truncate">
                              {role.name}
                            </span>
                            {isSystem ? (
                              <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200/70 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                                <FiLock className="text-[9px]" />
                                System Role
                              </span>
                            ) : (
                              <span className="inline-flex items-center bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                                Custom Role
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-6">
                      <p className="text-xs text-[#6E6763] max-w-xs line-clamp-2">
                        {role.description || (
                          <span className="text-[#A39A94] italic">
                            No description provided.
                          </span>
                        )}
                      </p>
                    </td>

                    {/* Permitted Modules */}
                    <td className="py-4 px-6">
                      {isAllModules ? (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                            <FiCheck className="text-xs" />
                            All 7 Business Modules
                          </span>
                        </div>
                      ) : activeModules.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {activeModules.slice(0, 3).map((mod) => (
                            <span
                              key={mod}
                              className="bg-[#FAF7F5] border border-[#EBE6E3] text-[#2D3436] px-1.5 py-0.5 rounded text-[10px] font-medium"
                            >
                              {MODULE_DISPLAY_NAMES[mod] || mod}
                            </span>
                          ))}
                          {activeModules.length > 3 && (
                            <span className="bg-[#FAF7F5] border border-[#EBE6E3] text-[#817B77] px-1.5 py-0.5 rounded text-[10px] font-medium">
                              +{activeModules.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#A39A94] text-xs">
                          No permissions
                        </span>
                      )}
                    </td>

                    {/* Assigned Admins Count */}
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          assignedCount > 0
                            ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                            : "bg-[#FAF7F5] text-[#817B77] border border-[#EBE6E3]"
                        }`}
                        title={`${assignedCount} administrator account(s) currently assigned to this role`}
                      >
                        <FiUsers className="text-[11px]" />
                        <span>{assignedCount}</span>
                      </span>
                    </td>

                    {/* Last Updated */}
                    <td className="py-4 px-6 text-[#817B77] text-xs">
                      {formatActivityTime(role.updatedAt || role.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Permissions Action (available for all roles) */}
                        <button
                          type="button"
                          onClick={() => onViewRole(role)}
                          className="p-1.5 text-[#817B77] hover:text-[#2D3436] hover:bg-[#F5F2F0] rounded-lg transition cursor-pointer"
                          title="View Permissions Matrix"
                          aria-label={`View permissions for ${role.name}`}
                        >
                          <FiEye className="text-sm" />
                        </button>

                        {/* Edit Role Action (Custom roles only) */}
                        {isSystem ? (
                          <span
                            className="p-1.5 text-[#C4BEBA] cursor-not-allowed"
                            title="System roles are immutable and cannot be edited"
                          >
                            <FiLock className="text-sm" />
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => onEditRole(role)}
                              className="p-1.5 text-[#817B77] hover:text-[#2D3436] hover:bg-[#F5F2F0] rounded-lg transition cursor-pointer"
                              title="Edit Custom Role"
                              aria-label={`Edit ${role.name}`}
                            >
                              <FiEdit2 className="text-sm" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDeleteRole(role)}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                assignedCount > 0
                                  ? "text-[#A39A94] hover:text-amber-700 hover:bg-amber-50"
                                  : "text-[#817B77] hover:text-red-600 hover:bg-red-50"
                              }`}
                              title={
                                assignedCount > 0
                                  ? `Role is assigned to ${assignedCount} user(s). Reassign them first.`
                                  : "Delete Custom Role"
                              }
                              aria-label={`Delete ${role.name}`}
                            >
                              <FiTrash2 className="text-sm" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RolesTable;
