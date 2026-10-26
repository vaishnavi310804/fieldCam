import { useState, useEffect } from "react";
import {
  FiX,
  FiPower,
  FiAlertCircle,
  FiCheckCircle,
  FiLock,
  FiClock,
} from "react-icons/fi";
import { updateAdminStatus } from "../../services/adminUserService.js";

const ChangeAdminStatusModal = ({
  isOpen,
  onClose,
  onSuccess = () => {},
  admin = null,
  currentUser = null,
}) => {
  const [selectedStatus, setSelectedStatus] = useState("ACTIVE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isSuperAdmin = admin?.role === "SUPER_ADMIN";
  const currentUserId = (currentUser?.id || currentUser?._id || "").toString();
  const targetUserId = (admin?._id || "").toString();
  const isSelf = currentUserId && targetUserId && currentUserId === targetUserId;

  const currentStatus = admin?.status || "INACTIVE";
  const isVerified = Boolean(admin?.isVerified);

  useEffect(() => {
    if (!isOpen || !admin) return;
    setError("");
    setSelectedStatus(admin.status || "ACTIVE");
  }, [isOpen, admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSuperAdmin) {
      setError("Super Admin accounts cannot be modified through Admin Users APIs.");
      return;
    }

    if (isSelf && selectedStatus !== "ACTIVE") {
      setError("You cannot deactivate or suspend your own Super Admin account.");
      return;
    }

    if (selectedStatus === currentStatus) {
      setError("The selected status is identical to the current account status.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await updateAdminStatus(admin._id, selectedStatus);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to update admin account status:", err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update administrator account status.";
      setError(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#EBE6E3] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF7F5] border-b border-[#EBE6E3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5141F5] text-white flex items-center justify-center shadow-xs">
              <FiPower className="text-base" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D3436]">
                Change Account Status
              </h2>
              <p className="text-[11px] text-[#817B77]">
                Manage login and operational access for this administrator.
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

          {isSuperAdmin ? (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <FiLock className="text-sm" />
                <span>Super Admin Account Protected</span>
              </div>
              <p>
                <strong>{admin.name}</strong> is a Super Admin. Super Admin accounts
                cannot be deactivated or suspended through the Admin Users interface.
              </p>
            </div>
          ) : (
            <>
              {/* Target User Summary Card */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F5] border border-[#EBE6E3] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2D3436] text-xs">
                    {admin.name}
                  </span>
                  <span className="text-[10px] text-[#817B77]">
                    Current Status:{" "}
                    <strong className="text-[#2D3436]">{currentStatus}</strong>
                  </span>
                </div>
                <p className="text-[11px] text-[#6E6763]">{admin.email}</p>
              </div>

              {!isVerified && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                  <FiClock className="text-sm mt-0.5 shrink-0" />
                  <span>
                    <strong>Pending Activation:</strong> This account has not yet completed OTP verification. Modifying status does not bypass required password onboarding.
                  </span>
                </div>
              )}

              {/* Status Radio Choices */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#2D3436]">
                  Select New Account Status
                </label>

                {/* ACTIVE */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition select-none ${
                    selectedStatus === "ACTIVE"
                      ? "bg-emerald-50/60 border-emerald-300 text-emerald-950 ring-1 ring-emerald-300"
                      : "bg-white border-[#EBE6E3] text-[#2D3436] hover:bg-[#FAF7F5]"
                  }`}
                >
                  <input
                    type="radio"
                    name="adminStatus"
                    value="ACTIVE"
                    checked={selectedStatus === "ACTIVE"}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={submitting}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold block text-emerald-800">
                      Active
                    </span>
                    <span className="text-[11px] text-[#6E6763]">
                      Administrator can log in and perform permitted business actions.
                    </span>
                  </div>
                </label>

                {/* INACTIVE */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition select-none ${
                    selectedStatus === "INACTIVE"
                      ? "bg-amber-50/60 border-amber-300 text-amber-950 ring-1 ring-amber-300"
                      : "bg-white border-[#EBE6E3] text-[#2D3436] hover:bg-[#FAF7F5]"
                  }`}
                >
                  <input
                    type="radio"
                    name="adminStatus"
                    value="INACTIVE"
                    checked={selectedStatus === "INACTIVE"}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={submitting}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold block text-amber-800">
                      Inactive
                    </span>
                    <span className="text-[11px] text-[#6E6763]">
                      Login is disallowed until reactivated or completed.
                    </span>
                  </div>
                </label>

                {/* SUSPENDED */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition select-none ${
                    selectedStatus === "SUSPENDED"
                      ? "bg-rose-50/60 border-rose-300 text-rose-950 ring-1 ring-rose-300"
                      : "bg-white border-[#EBE6E3] text-[#2D3436] hover:bg-[#FAF7F5]"
                  }`}
                >
                  <input
                    type="radio"
                    name="adminStatus"
                    value="SUSPENDED"
                    checked={selectedStatus === "SUSPENDED"}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={submitting}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold block text-rose-800">
                      Suspended
                    </span>
                    <span className="text-[11px] text-[#6E6763]">
                      Account access is immediately terminated with suspension notice.
                    </span>
                  </div>
                </label>
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
                disabled={submitting || selectedStatus === currentStatus}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#817B77] hover:bg-[#6E6763] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {submitting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{submitting ? "Updating Status..." : "Update Status"}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeAdminStatusModal;
