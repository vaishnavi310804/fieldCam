import { useState, useEffect, useMemo } from "react";
import {
  FiX,
  FiShield,
  FiAlertCircle,
  FiCheck,
  FiInfo,
} from "react-icons/fi";
import {
  PERMISSION_MODULES,
  MODULE_ACTIONS,
} from "../../utils/permissions.js";
import { createRole, updateRole } from "../../services/roleService.js";

const RESERVED_NAMES = [
  "FULL_ADMIN",
  "FULL ADMIN",
  "SUPER_ADMIN",
  "SUPER ADMIN",
  "ADMIN",
  "VENDOR",
  "STAFF",
];

const MODULE_METADATA = {
  DASHBOARD: {
    label: "Dashboard",
    description: "Overview metrics & active status telemetry",
  },
  PROJECTS: {
    label: "Projects",
    description: "Installations, site audits, and submissions",
  },
  VENDORS: {
    label: "Vendors",
    description: "Vendor profiles, verification & registrations",
  },
  INVOICES: {
    label: "Invoices",
    description: "Financial lifecycle, approvals & disbursements",
  },
  ANALYTICS: {
    label: "Analytics",
    description: "Platform utilization & vendor performance reports",
  },
  SERVICES: {
    label: "Services",
    description: "Service catalog & rate configurations",
  },
  SUPPORT: {
    label: "Support",
    description: "Customer service tickets & real-time chat",
  },
};

const ACTION_LABELS = {
  VIEW: "View",
  CREATE: "Create",
  EDIT: "Edit",
  ASSIGN: "Assign",
  REVIEW: "Review",
  EXPORT: "Export",
  STATUS: "Status",
  REGISTRATIONS_REVIEW: "Registrations",
  SEND: "Send",
  RECORD_PAYMENT: "Payment",
  CHAT: "Chat",
};

const CreateEditRoleModal = ({
  isOpen,
  onClose,
  onSuccess = () => {},
  roleToEdit = null,
}) => {
  const isEditMode = Boolean(roleToEdit && roleToEdit._id);
  const isSystemRole = Boolean(roleToEdit && roleToEdit.isSystem);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize permission state whenever modal opens or roleToEdit changes
  useEffect(() => {
    if (!isOpen) return;

    setError("");
    const initialMap = {};
    for (const mod of Object.values(PERMISSION_MODULES)) {
      initialMap[mod] = new Set();
    }

    if (roleToEdit) {
      setName(roleToEdit.name || "");
      setDescription(roleToEdit.description || "");

      if (Array.isArray(roleToEdit.permissions)) {
        for (const item of roleToEdit.permissions) {
          const mod = (item.module || "").toUpperCase();
          if (initialMap[mod] && Array.isArray(item.actions)) {
            for (const act of item.actions) {
              const actUpper = (act || "").toUpperCase();
              if (MODULE_ACTIONS[mod]?.includes(actUpper)) {
                initialMap[mod].add(actUpper);
              }
            }
          }
        }
      }
    } else {
      setName("");
      setDescription("");
    }

    setSelectedPermissions(initialMap);
  }, [isOpen, roleToEdit]);

  // Total count of selected actions
  const totalSelectedCount = useMemo(() => {
    let count = 0;
    for (const mod of Object.values(PERMISSION_MODULES)) {
      count += selectedPermissions[mod]?.size || 0;
    }
    return count;
  }, [selectedPermissions]);

  // Toggle single action for a module
  const handleToggleAction = (moduleKey, actionKey) => {
    if (isSystemRole) return;
    setError("");

    setSelectedPermissions((prev) => {
      const next = { ...prev };
      const currentSet = new Set(next[moduleKey] || []);
      if (currentSet.has(actionKey)) {
        currentSet.delete(actionKey);
      } else {
        currentSet.add(actionKey);
      }
      next[moduleKey] = currentSet;
      return next;
    });
  };

  // Select all valid actions for a specific module
  const handleSelectRowAll = (moduleKey) => {
    if (isSystemRole) return;
    setError("");

    const validActions = MODULE_ACTIONS[moduleKey] || [];
    setSelectedPermissions((prev) => ({
      ...prev,
      [moduleKey]: new Set(validActions),
    }));
  };

  // Clear all actions for a specific module
  const handleSelectRowNone = (moduleKey) => {
    if (isSystemRole) return;
    setError("");

    setSelectedPermissions((prev) => ({
      ...prev,
      [moduleKey]: new Set(),
    }));
  };

  // Global shortcut: Select all valid permissions across all 7 business modules
  const handleSelectAllGlobal = () => {
    if (isSystemRole) return;
    setError("");

    const next = {};
    for (const mod of Object.values(PERMISSION_MODULES)) {
      next[mod] = new Set(MODULE_ACTIONS[mod] || []);
    }
    setSelectedPermissions(next);
  };

  // Global shortcut: Clear all
  const handleClearAllGlobal = () => {
    if (isSystemRole) return;
    setError("");

    const next = {};
    for (const mod of Object.values(PERMISSION_MODULES)) {
      next[mod] = new Set();
    }
    setSelectedPermissions(next);
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSystemRole) {
      setError("System roles (including FULL_ADMIN) cannot be modified.");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 50) {
      setError("Role name is required and must be between 2 and 50 characters.");
      return;
    }

    const nameKey = trimmedName.toUpperCase().replace(/\s+/g, "_");
    if (
      RESERVED_NAMES.includes(trimmedName.toUpperCase()) ||
      RESERVED_NAMES.includes(nameKey)
    ) {
      setError(`The role name '${trimmedName}' is reserved by the platform.`);
      return;
    }

    // Assemble permissions array
    const permissionsPayload = [];
    for (const mod of Object.values(PERMISSION_MODULES)) {
      const actSet = selectedPermissions[mod];
      if (actSet && actSet.size > 0) {
        permissionsPayload.push({
          module: mod,
          actions: Array.from(actSet),
        });
      }
    }

    if (permissionsPayload.length === 0) {
      setError(
        "Please select at least one permission action for this role."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: trimmedName,
        description: description.trim(),
        permissions: permissionsPayload,
      };

      if (isEditMode) {
        await updateRole(roleToEdit._id, payload);
      } else {
        await createRole(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save role:", err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred while saving the role.";
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-[#EBE6E3] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF7F5] border-b border-[#EBE6E3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5141F5] text-white flex items-center justify-center shadow-xs">
              <FiShield className="text-base" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D3436]">
                {isEditMode ? "Edit Custom Role" : "Create Custom Role"}
              </h2>
              <p className="text-[11px] text-[#817B77]">
                {isEditMode
                  ? "Update permissions and details for this administrative role."
                  : "Define a new custom administrative role with tailored access."}
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

        {/* Modal Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto flex-1"
        >
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
              <FiAlertCircle className="text-sm mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* System Role Immutability Notice */}
          {isSystemRole && (
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-medium flex items-start gap-2">
              <FiInfo className="text-sm mt-0.5 shrink-0" />
              <span>
                <strong>System Role:</strong> This role is built into the FieldCam
                platform. Its permissions and settings are immutable to guarantee
                system integrity.
              </span>
            </div>
          )}

          {/* Role Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role Name */}
            <div>
              <label className="block text-xs font-semibold text-[#2D3436] mb-1">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSystemRole || loading}
                placeholder="e.g. Project Operations Lead"
                className="w-full h-10 px-3 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl text-xs text-[#2D3436] focus:border-[#5141F5] focus:bg-white focus:outline-none transition disabled:opacity-60 disabled:cursor-not-allowed"
                maxLength={50}
                required
              />
              <p className="text-[10px] text-[#817B77] mt-1">
                Must be unique across roles.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#2D3436] mb-1">
                Description <span className="text-[#A39A94] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSystemRole || loading}
                placeholder="Brief summary of duties and privileges..."
                className="w-full h-10 px-3 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl text-xs text-[#2D3436] focus:border-[#5141F5] focus:bg-white focus:outline-none transition disabled:opacity-60 disabled:cursor-not-allowed"
                maxLength={500}
              />
              <p className="text-[10px] text-[#817B77] mt-1">
                Displayed in the role directory for administrators.
              </p>
            </div>
          </div>

          {/* Permission Matrix Section */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#EBE6E3]">
              <div>
                <h3 className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">
                  Permission Matrix
                </h3>
                <p className="text-[11px] text-[#817B77]">
                  Configure access to FieldCam's business modules.
                </p>
              </div>

              {!isSystemRole && (
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleSelectAllGlobal}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#5141F5] bg-[#F8F7FF] hover:bg-[#EEEDFE] border border-[#5141F5]/20 rounded-lg transition cursor-pointer"
                  >
                    Select All Valid
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllGlobal}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#817B77] bg-white hover:bg-[#F5F2F0] border border-[#EBE6E3] rounded-lg transition cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Matrix Table */}
            <div className="bg-white border border-[#EBE6E3] rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[720px]">
                  <thead>
                    <tr className="bg-[#FAF7F5] border-b border-[#EBE6E3] text-[10px] font-bold text-[#817B77] uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-44">Module</th>
                      <th className="py-2.5 px-3 text-center w-20">View</th>
                      <th className="py-2.5 px-3 text-center w-20">Create</th>
                      <th className="py-2.5 px-3 text-center w-20">Edit</th>
                      <th className="py-2.5 px-4">Workflow & Operational Actions</th>
                      <th className="py-2.5 px-3 text-right w-24">Shortcuts</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#F2EBE5] text-xs">
                    {Object.values(PERMISSION_MODULES).map((mod) => {
                      const meta = MODULE_METADATA[mod] || {
                        label: mod,
                        description: "",
                      };
                      const validActions = MODULE_ACTIONS[mod] || [];
                      const activeSet = selectedPermissions[mod] || new Set();

                      // Separate standard actions vs workflow actions
                      const hasView = validActions.includes("VIEW");
                      const hasCreate = validActions.includes("CREATE");
                      const hasEdit = validActions.includes("EDIT");
                      const workflowActions = validActions.filter(
                        (a) => !["VIEW", "CREATE", "EDIT"].includes(a)
                      );

                      const isViewChecked = activeSet.has("VIEW");
                      const isCreateChecked = activeSet.has("CREATE");
                      const isEditChecked = activeSet.has("EDIT");

                      return (
                        <tr
                          key={mod}
                          className="hover:bg-[#FAF7F5]/50 transition-colors"
                        >
                          {/* Module Name & Details */}
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-bold text-[#2D3436] text-xs">
                                {meta.label}
                              </span>
                              <p className="text-[10px] text-[#817B77] leading-tight">
                                {meta.description}
                              </p>
                            </div>
                          </td>

                          {/* View Checkbox */}
                          <td className="py-3 px-3 text-center">
                            {hasView ? (
                              <label
                                className={`inline-flex items-center justify-center p-1 rounded transition select-none ${
                                  isSystemRole
                                    ? "cursor-default opacity-80"
                                    : "cursor-pointer hover:bg-slate-100"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isViewChecked}
                                  disabled={isSystemRole}
                                  onChange={() => handleToggleAction(mod, "VIEW")}
                                  className="w-4 h-4 text-[#5141F5] rounded border-[#EBE6E3] focus:ring-[#5141F5] cursor-pointer"
                                />
                              </label>
                            ) : (
                              <span className="text-[#C4BEBA] font-bold text-xs select-none">
                                —
                              </span>
                            )}
                          </td>

                          {/* Create Checkbox */}
                          <td className="py-3 px-3 text-center">
                            {hasCreate ? (
                              <label
                                className={`inline-flex items-center justify-center p-1 rounded transition select-none ${
                                  isSystemRole
                                    ? "cursor-default opacity-80"
                                    : "cursor-pointer hover:bg-slate-100"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isCreateChecked}
                                  disabled={isSystemRole}
                                  onChange={() =>
                                    handleToggleAction(mod, "CREATE")
                                  }
                                  className="w-4 h-4 text-[#5141F5] rounded border-[#EBE6E3] focus:ring-[#5141F5] cursor-pointer"
                                />
                              </label>
                            ) : (
                              <span className="text-[#C4BEBA] font-bold text-xs select-none">
                                —
                              </span>
                            )}
                          </td>

                          {/* Edit Checkbox */}
                          <td className="py-3 px-3 text-center">
                            {hasEdit ? (
                              <label
                                className={`inline-flex items-center justify-center p-1 rounded transition select-none ${
                                  isSystemRole
                                    ? "cursor-default opacity-80"
                                    : "cursor-pointer hover:bg-slate-100"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isEditChecked}
                                  disabled={isSystemRole}
                                  onChange={() =>
                                    handleToggleAction(mod, "EDIT")
                                  }
                                  className="w-4 h-4 text-[#5141F5] rounded border-[#EBE6E3] focus:ring-[#5141F5] cursor-pointer"
                                />
                              </label>
                            ) : (
                              <span className="text-[#C4BEBA] font-bold text-xs select-none">
                                —
                              </span>
                            )}
                          </td>

                          {/* Workflow & Special Actions */}
                          <td className="py-3 px-4">
                            {workflowActions.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {workflowActions.map((act) => {
                                  const isChecked = activeSet.has(act);
                                  const label = ACTION_LABELS[act] || act;

                                  return (
                                    <label
                                      key={act}
                                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-medium transition select-none ${
                                        isChecked
                                          ? "bg-purple-50 border-purple-200 text-purple-800"
                                          : "bg-white border-[#EBE6E3] text-[#6E6763] hover:bg-[#FAF7F5]"
                                      } ${
                                        isSystemRole
                                          ? "cursor-default"
                                          : "cursor-pointer"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={isSystemRole}
                                        onChange={() =>
                                          handleToggleAction(mod, act)
                                        }
                                        className="w-3.5 h-3.5 text-[#5141F5] rounded border-[#EBE6E3] focus:ring-[#5141F5]"
                                      />
                                      <span>{label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-[#C4BEBA] font-bold text-xs select-none">
                                —
                              </span>
                            )}
                          </td>

                          {/* Row Shortcuts: All / None */}
                          <td className="py-3 px-3 text-right">
                            {!isSystemRole ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSelectRowAll(mod)}
                                  className="px-1.5 py-0.5 text-[10px] font-bold text-[#817B77] hover:text-[#5141F5] hover:bg-slate-100 rounded transition cursor-pointer"
                                  title={`Select all valid ${meta.label} actions`}
                                >
                                  All
                                </button>
                                <span className="text-[#C4BEBA] text-[10px]">
                                  /
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleSelectRowNone(mod)}
                                  className="px-1.5 py-0.5 text-[10px] font-bold text-[#817B77] hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                  title={`Deselect all ${meta.label} actions`}
                                >
                                  None
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-[#A39A94] italic">
                                Locked
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

            <div className="flex items-center justify-between text-[11px] text-[#817B77] px-1 pt-1">
              <span>
                Active permission actions:{" "}
                <strong className="text-[#2D3436]">
                  {totalSelectedCount}
                </strong>
              </span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#EBE6E3] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-[#EBE6E3] rounded-xl text-xs font-semibold text-[#6E6763] hover:bg-[#F5F2F0] transition cursor-pointer disabled:opacity-60"
            >
              Cancel
            </button>

            {!isSystemRole && (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#817B77] hover:bg-[#6E6763] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {loading && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>
                  {loading
                    ? isEditMode
                      ? "Saving Changes..."
                      : "Creating Role..."
                    : isEditMode
                    ? "Save Changes"
                    : "Create Role"}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditRoleModal;
