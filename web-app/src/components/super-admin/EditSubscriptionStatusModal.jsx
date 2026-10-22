import { useState, useEffect } from "react";
import { FiX, FiCheck, FiAlertCircle, FiEdit2 } from "react-icons/fi";
import { updateSubscriptionStatus } from "../../services/subscriptionService";

const SUPPORTED_STATUSES = ["Active", "Past Due", "Cancelled", "Trial"];

const getStatusBadge = (status) => {
  switch (status) {
    case "Active":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      );
    case "Past Due":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Past Due
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Cancelled
        </span>
      );
    case "Trial":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Trial
        </span>
      );
    case "Unassigned":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Unassigned
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
          {status || "Unknown"}
        </span>
      );
  }
};

const EditSubscriptionStatusModal = ({
  isOpen = false,
  subscription = null,
  onClose = () => {},
  onSuccess = () => {},
  onUpdate = null,
}) => {
  const [prevSubId, setPrevSubId] = useState(
    subscription?._id || subscription?.subscriptionId || null
  );
  const [selectedStatus, setSelectedStatus] = useState(
    subscription?.status || "Active"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentSubId =
    subscription?._id || subscription?.subscriptionId || null;

  if (currentSubId !== prevSubId) {
    setPrevSubId(currentSubId);
    setSelectedStatus(subscription?.status || "Active");
    setError("");
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !subscription) return null;

  const currentStatus = subscription.status || "Active";
  const isUnchanged = selectedStatus === currentStatus;
  const subId = subscription.subscriptionId || subscription._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUnchanged || loading) return;

    if (!subId) {
      setError("Subscription record ID is missing. Cannot update status.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (typeof onUpdate === "function") {
        await onUpdate(subId, selectedStatus);
      } else {
        await updateSubscriptionStatus(subId, selectedStatus);
      }

      if (typeof onSuccess === "function") {
        await onSuccess();
      }

      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update subscription status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#EBE6E3] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF7F5] border-b border-[#EBE6E3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#817B77]/10 text-[#817B77] flex items-center justify-center">
              <FiEdit2 className="text-sm" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D3436]">
                Edit Subscription Status
              </h2>
              <p className="text-[11px] text-[#817B77]">
                Update the active status for this organization's subscription.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-[#817B77] hover:text-[#2D3436] hover:bg-[#F5F2F0] rounded-lg transition cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Read-Only Company & Plan Context Card */}
            <div className="bg-[#FAF7F5] rounded-xl p-4 border border-[#EBE6E3] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#817B77] uppercase tracking-wider">
                  Company
                </span>
                <span
                  className="text-xs font-bold text-[#2D3436] text-right truncate max-w-[220px]"
                  title={subscription.companyName}
                >
                  {subscription.companyName || "Unknown Company"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#817B77] uppercase tracking-wider">
                  Assigned Plan
                </span>
                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-white border border-[#EBE6E3] text-[#2D3436]">
                  {subscription.planName || subscription.planCode || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#817B77] uppercase tracking-wider">
                  Current Status
                </span>
                <div>{getStatusBadge(subscription.status)}</div>
              </div>
            </div>

            {/* Editable Status Dropdown */}
            <div>
              <label
                htmlFor="subscription-status-select"
                className="block text-xs font-bold text-[#2D3436] mb-1.5"
              >
                Subscription Status
              </label>
              <select
                id="subscription-status-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setError("");
                }}
                disabled={loading}
                className="w-full h-10 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl px-3.5 text-xs font-medium text-[#2D3436] outline-none focus:border-[#5141F5] focus:bg-white transition cursor-pointer disabled:opacity-50"
              >
                {SUPPORTED_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#817B77] mt-1.5">
                Select a valid subscription lifecycle status.
              </p>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="px-6 py-4 bg-white border-t border-[#EBE6E3] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-[#6E6763] hover:text-[#2D3436] hover:bg-[#F5F2F0] rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isUnchanged}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#817B77] hover:bg-[#6E6763] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <FiCheck className="text-xs" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubscriptionStatusModal;
