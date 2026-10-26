import { useState, useEffect } from "react";
import {
  FiX,
  FiShield,
  FiAlertCircle,
  FiUser,
  FiLock,
  FiCheckCircle,
} from "react-icons/fi";
import { getRoles } from "../../services/roleService.js";
import { reassignAdminRole } from "../../services/adminUserService.js";

const ReassignAdminRoleModal = ({
  isOpen,
  onClose,
  onSuccess = () => {},
  admin = null,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [rolesError, setRolesError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isSuperAdmin = admin?.role === "SUPER_ADMIN";
  const currentRoleId = admin?.roleId?._id || admin?.roleId || "";
  const currentRoleName = admin?.roleId?.name || (isSuperAdmin ? "SUPER_ADMIN" : "FULL_ADMIN (Default Fallback)");

  // Load available roles when modal opens
  useEffect(() => {
    if (!isOpen || !admin) return;

    setError("");
    setSelectedRoleId(currentRoleId || "");

    const loadRoles = async () => {
      setLoadingRoles(true);
      setRolesError("");
      try {
        const res = await getRoles();
        if (res?.success && Array.isArray(res?.data)) {
          const eligible = res.data.filter(
            (r) =>
              r.name !== "SUPER_ADMIN" &&
              r.name !== "SUPER ADMIN"
          );
          setAvailableRoles(eligible);

          // If admin has no roleId (legacy FULL_ADMIN default), set initial selectedRoleId to FULL_ADMIN if found
          if (!currentRoleId) {
            const fullAdmin = eligible.find(
              (r) => r.isSystem || r.name.toUpperCase() === "FULL_ADMIN"
            );
            if (fullAdmin) {
              setSelectedRoleId(fullAdmin._id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load eligible roles for reassignment:", err);
        setRolesError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load roles from the platform."
        );
      } finally {
        setLoadingRoles(false);
      }
    };

    if (!isSuperAdmin) {
      loadRoles();
    }
  }, [isOpen, admin, currentRoleId, isSuperAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSuperAdmin) {
      setError("Super Admin roles cannot be modified via Admin Users APIs.");
      return;
    }

    if (!selectedRoleId) {
      setError("Please select an eligible role to assign.");
      return;
    }

    if (selectedRoleId === currentRoleId) {
      setError("The selected role is identical to the administrator's current role.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await reassignAdminRole(admin._id, selectedRoleId);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to reassign admin role:", err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reassign administrator role.";
      setError(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#EBE6E3] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF7F5] border-b border-[#EBE6E3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5141F5] text-white flex items-center justify-center shadow-xs">
              <FiShield className="text-base" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D3436]">
                Reassign Administrator Role
              </h2>
              <p className="text-[11px] text-[#817B77]">
                Update permission scope for this administrative account.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
              <FiAlertCircle className="text-sm mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {rolesError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start gap-2">
              <FiAlertCircle className="text-sm mt-0.5 shrink-0" />
              <span>{rolesError}</span>
            </div>
          )}

          {isSuperAdmin ? (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <FiLock className="text-sm" />
                <span>Super Admin Account Protected</span>
              </div>
              <p>
                <strong>{admin.name}</strong> ({admin.email}) is a Platform Super Admin.
                Super Admin authorization bypasses role definitions and cannot be
                reassigned through this interface.
              </p>
            </div>
          ) : (
            <>
              {/* Target Admin Card */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F5] border border-[#EBE6E3] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2D3436] text-xs">
                    {admin.name}
                  </span>
                  <span className="text-[10px] text-[#817B77]">
                    ID: {admin._id.slice(-6)}
                  </span>
                </div>
                <p className="text-[11px] text-[#6E6763]">{admin.email}</p>
                <div className="pt-1 flex items-center gap-1.5 text-xs text-[#817B77]">
                  <span>Current Role:</span>
                  <strong className="text-[#2D3436]">{currentRoleName}</strong>
                </div>
              </div>

              {!admin.roleId && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px]">
                  <strong>Legacy Account Notice:</strong> This administrator currently
                  has no explicit Role document and inherits the default FULL_ADMIN
                  permission suite. Assigning a role below will attach a dedicated Role record.
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#2D3436] mb-1">
                  New Assigned Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    disabled={submitting || loadingRoles}
                    className="w-full h-10 pl-9 pr-8 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl text-xs text-[#2D3436] focus:border-[#5141F5] focus:bg-white focus:outline-none transition disabled:opacity-60 cursor-pointer appearance-none"
                    required
                  >
                    {loadingRoles ? (
                      <option value="">Loading eligible roles...</option>
                    ) : (
                      availableRoles.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} {r.isSystem ? "(System Role - Full Admin)" : "(Custom Role)"}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <p className="text-[10px] text-[#817B77] mt-1">
                  Updating this role immediately invalidates the administrator's permission cache.
                </p>
              </div>
            </>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#EBE6E3] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-[#EBE6E3] rounded-xl text-xs font-semibold text-[#6E6763] hover:bg-[#F5F2F0] transition cursor-pointer disabled:opacity-60"
            >
              {isSuperAdmin ? "Close" : "Cancel"}
            </button>

            {!isSuperAdmin && (
              <button
                type="submit"
                disabled={submitting || loadingRoles || !selectedRoleId}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#817B77] hover:bg-[#6E6763] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {submitting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{submitting ? "Reassigning..." : "Reassign Role"}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReassignAdminRoleModal;
