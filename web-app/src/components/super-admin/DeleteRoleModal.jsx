import { useState } from "react";
import { FiAlertTriangle, FiLock, FiX, FiUsers } from "react-icons/fi";
import { deleteRole } from "../../services/roleService.js";

const DeleteRoleModal = ({
  isOpen,
  onClose,
  onSuccess = () => {},
  role = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !role) return null;

  const isSystemRole = Boolean(role.isSystem);
  const assignedUsersCount = Number(role.userCount) || 0;
  const isDeletionBlocked = isSystemRole || assignedUsersCount > 0;

  const handleDelete = async () => {
    if (isDeletionBlocked) return;

    setLoading(true);
    setError("");

    try {
      await deleteRole(role._id);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to delete role:", err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete role. Please try again.";
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#EBE6E3] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF7F5] border-b border-[#EBE6E3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs ${
                isSystemRole
                  ? "bg-purple-100 text-purple-700"
                  : assignedUsersCount > 0
                  ? "bg-amber-100 text-amber-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {isSystemRole ? (
                <FiLock className="text-base" />
              ) : (
                <FiAlertTriangle className="text-base" />
              )}
            </div>
            <h2 className="text-base font-bold text-[#2D3436]">
              {isSystemRole
                ? "Protected System Role"
                : assignedUsersCount > 0
                ? "Cannot Delete Role"
                : "Delete Custom Role"}
            </h2>
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
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {isSystemRole ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs leading-relaxed">
                <p className="font-bold mb-1">
                  System roles cannot be deleted.
                </p>
                <p>
                  <strong>{role.name}</strong> is a foundational platform role
                  required for FieldCam administrative functionality. It is
                  permanently protected.
                </p>
              </div>
            </div>
          ) : assignedUsersCount > 0 ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <FiUsers className="text-sm" />
                  <span>Role is actively assigned</span>
                </div>
                <p>
                  Cannot delete role <strong>{role.name}</strong>. It is currently
                  assigned to{" "}
                  <strong>{assignedUsersCount} administrator account(s)</strong>.
                </p>
                <p className="mt-2 text-[11px] text-amber-800">
                  Please reassign all assigned users to another role in Admin Users
                  before deleting this role.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-[#2D3436] leading-relaxed">
                Are you sure you want to permanently delete the custom role{" "}
                <strong className="text-red-700 font-bold">{role.name}</strong>?
              </p>
              <p className="text-[11px] text-[#817B77]">
                This action cannot be undone. Its custom permission declarations
                will be permanently removed from the system.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF7F5] border-t border-[#EBE6E3] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-[#EBE6E3] rounded-xl text-xs font-semibold text-[#6E6763] hover:bg-[#F5F2F0] transition cursor-pointer"
          >
            {isDeletionBlocked ? "Close" : "Cancel"}
          </button>

          {!isDeletionBlocked && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              {loading && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{loading ? "Deleting..." : "Delete Role"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteRoleModal;
