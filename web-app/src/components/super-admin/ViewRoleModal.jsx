import { FiX, FiShield, FiCheck, FiLock } from "react-icons/fi";
import {
  PERMISSION_MODULES,
  MODULE_ACTIONS,
} from "../../utils/permissions.js";

const MODULE_DISPLAY_NAMES = {
  DASHBOARD: "Dashboard",
  PROJECTS: "Projects",
  VENDORS: "Vendors",
  INVOICES: "Invoices",
  ANALYTICS: "Analytics",
  SERVICES: "Services",
  SUPPORT: "Support",
};

const ViewRoleModal = ({ isOpen, onClose, role = null }) => {
  if (!isOpen || !role) return null;

  const isSystem = Boolean(role.isSystem);
  const permissionsList = Array.isArray(role.permissions)
    ? role.permissions
    : [];

  // Map module to set of actions
  const permMap = new Map();
  for (const item of permissionsList) {
    if (item && item.module) {
      permMap.set(
        item.module.toUpperCase(),
        new Set(Array.isArray(item.actions) ? item.actions.map((a) => a.toUpperCase()) : [])
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#EBE6E3] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF7F5] border-b border-[#EBE6E3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs ${
                isSystem
                  ? "bg-purple-100 text-purple-700"
                  : "bg-[#F5F2F0] text-[#6E6763]"
              }`}
            >
              <FiShield className="text-base" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#2D3436]">
                  {role.name}
                </h2>
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
              <p className="text-[11px] text-[#817B77] mt-0.5">
                {role.description || "No description provided."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#817B77] hover:text-[#2D3436] hover:bg-[#F5F2F0] rounded-lg transition cursor-pointer"
            title="Close modal"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between text-xs text-[#817B77] pb-2 border-b border-[#EBE6E3]">
            <span>Assigned Users: <strong>{role.userCount || 0}</strong></span>
            <span>
              {isSystem
                ? "Permissions are immutable system defaults"
                : "Configured permissions"}
            </span>
          </div>

          <div className="bg-white border border-[#EBE6E3] rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F5] border-b border-[#EBE6E3] text-[10px] font-bold text-[#817B77] uppercase tracking-wider">
                  <th className="py-2.5 px-4 w-40">Module</th>
                  <th className="py-2.5 px-4">Granted Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EBE5]">
                {Object.values(PERMISSION_MODULES).map((mod) => {
                  const label = MODULE_DISPLAY_NAMES[mod] || mod;
                  const grantedSet = permMap.get(mod) || new Set();
                  const grantedActions = Array.from(grantedSet);

                  return (
                    <tr key={mod} className="hover:bg-[#FAF7F5]/50">
                      <td className="py-3 px-4 font-bold text-[#2D3436]">
                        {label}
                      </td>
                      <td className="py-3 px-4">
                        {grantedActions.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {grantedActions.map((act) => (
                              <span
                                key={act}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]"
                              >
                                <FiCheck className="text-[10px]" />
                                <span>{act}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#A39A94] italic text-[11px]">
                            No permissions granted
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF7F5] border-t border-[#EBE6E3] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#EBE6E3] rounded-xl text-xs font-semibold text-[#6E6763] hover:bg-[#F5F2F0] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRoleModal;
