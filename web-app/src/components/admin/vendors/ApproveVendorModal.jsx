import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiX,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiClock,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLayers,
  FiCalendar,
  FiFileText,
  FiLoader,
  FiRefreshCw,
  FiCheck,
  FiSlash,
} from "react-icons/fi";
import {
  getVendorRegistrations,
  approveVendorRegistration,
  rejectVendorRegistration,
} from "../../../services/vendorRegistrationService";
import { getSubscriptionPlans } from "../../../services/subscriptionService";

const STATUS_FILTERS = ["All", "Pending", "Approved", "Rejected"];

const ApproveVendorModal = ({ isOpen, onClose, onVendorApproved }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Action Confirmation States
  const [selectedRequestForApprove, setSelectedRequestForApprove] = useState(null);
  const [selectedRequestForReject, setSelectedRequestForReject] = useState(null);

  // Approval Configuration
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [durationMonths, setDurationMonths] = useState(1);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Rejection Configuration
  const [rejectionReason, setRejectionReason] = useState("");

  // In-flight action guard to prevent double-clicks
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getVendorRegistrations();
      setRequests(res.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load vendor registration requests"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await getSubscriptionPlans({ status: "PUBLISHED" });
      const published = res.data || [];
      setPlans(published);
      if (published.length > 0) {
        setSelectedPlanId(published[0]._id);
      }
    } catch {
      // Non-blocking fallback
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchRequests();
    fetchPlans();
    setSuccessMessage("");
    setError("");
  }, [isOpen, fetchRequests, fetchPlans]);

  const handleOpenApproveDialog = (request) => {
    setSelectedRequestForApprove(request);
    setStartDate(new Date().toISOString().split("T")[0]);
    setDurationMonths(1);
    if (plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0]._id);
    }
    setError("");
    setSuccessMessage("");
  };

  const handleConfirmApprove = async () => {
    if (!selectedRequestForApprove || isProcessingAction) return;

    try {
      setIsProcessingAction(true);
      setError("");

      const payload = {
        planId: selectedPlanId || undefined,
        startDate,
        durationMonths: Number(durationMonths) || 1,
      };

      const res = await approveVendorRegistration(selectedRequestForApprove._id, payload);
      setSuccessMessage(
        res.message || `Vendor ${selectedRequestForApprove.companyName} approved and provisioned successfully!`
      );

      // Close confirmation dialog
      setSelectedRequestForApprove(null);

      // Reload requests list to update status
      await fetchRequests();

      // Trigger parent callback to refresh main vendors list!
      if (typeof onVendorApproved === "function") {
        onVendorApproved();
      }

      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to approve registration request"
      );
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleOpenRejectDialog = (request) => {
    setSelectedRequestForReject(request);
    setRejectionReason("");
    setError("");
    setSuccessMessage("");
  };

  const handleConfirmReject = async () => {
    if (!selectedRequestForReject || isProcessingAction) return;

    try {
      setIsProcessingAction(true);
      setError("");

      const payload = {
        rejectionReason: rejectionReason.trim(),
      };

      const res = await rejectVendorRegistration(selectedRequestForReject._id, payload);
      setSuccessMessage(
        res.message || `Vendor registration request for ${selectedRequestForReject.companyName} rejected.`
      );

      // Close confirmation dialog
      setSelectedRequestForReject(null);

      // Reload requests list
      await fetchRequests();

      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to reject registration request"
      );
    } finally {
      setIsProcessingAction(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Filter by status tab
      if (activeFilter !== "All") {
        if (req.status !== activeFilter.toUpperCase()) return false;
      }

      // Filter by search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const company = (req.companyName || "").toLowerCase();
        const contact = (req.contactName || "").toLowerCase();
        const email = (req.email || "").toLowerCase();
        const loc = (req.location || "").toLowerCase();

        return (
          company.includes(query) ||
          contact.includes(query) ||
          email.includes(query) ||
          loc.includes(query)
        );
      }

      return true;
    });
  }, [requests, activeFilter, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-white border-b border-[#E8E2DE] shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#3E3734]">
              Vendor Registration Requests
            </h2>
            <p className="text-xs text-[#817B77] mt-0.5">
              Review and approve prospective vendor requests submitted.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#817B77] hover:bg-[#F0EBE8] hover:text-[#3E3734] transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Toolbar: Search & Filters */}
        <div className="px-6 py-3.5 bg-white border-b border-[#E8E2DE] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company, contact, email, or city..."
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
            />
          </div>

          {/* Filter Pills + Refresh */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#FAF7F5] border border-[#E8E2DE] p-1 rounded-xl">
              {STATUS_FILTERS.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#8A817C] text-white shadow-xs"
                        : "text-[#817B77] hover:text-[#3E3734]"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            {/* <button
              type="button"
              onClick={fetchRequests}
              disabled={loading}
              title="Refresh requests"
              className="w-8 h-8 rounded-xl border border-[#E8E2DE] bg-[#FAF7F5] hover:bg-[#E8E2DE] flex items-center justify-center text-[#817B77] transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
            </button> */}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-4 bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 shadow-xs shrink-0">
            <FiAlertCircle className="text-base shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 bg-[#E8F5E9] border border-[#2E7D32]/20 text-[#2E7D32] px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 shadow-xs shrink-0">
            <FiCheckCircle className="text-base shrink-0" />
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && (
            <div className="py-12 text-center text-xs text-[#817B77] flex items-center justify-center gap-2">
              <FiLoader className="animate-spin text-lg text-[#5141F5]" />
              <span>Loading registration requests...</span>
            </div>
          )}

          {!loading && filteredRequests.length === 0 && (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-10 text-center text-[#817B77]">
              <FiClock className="text-3xl mx-auto text-[#A39A94] mb-2" />
              <p className="text-sm font-semibold text-[#3E3734]">No registration requests found</p>
              <p className="text-xs text-[#A39A94] mt-1">
                {activeFilter !== "All"
                  ? `There are currently no requests with status "${activeFilter}".`
                  : "Prospective vendors who register from the login screen will appear here."}
              </p>
            </div>
          )}

          {!loading && filteredRequests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map((req) => {
                const initials =
                  (req.companyName || "VC")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "VC";

                const submittedDate = req.createdAt
                  ? new Date(req.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A";

                const isPending = req.status === "PENDING";
                const isApproved = req.status === "APPROVED";
                const isRejected = req.status === "REJECTED";

                return (
                  <div
                    key={req._id}
                    className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Avatar, Company, Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-[#8A817C] flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[#3E3734] truncate leading-tight">
                              {req.companyName}
                            </h3>
                            <p className="text-xs text-[#817B77] truncate mt-0.5">
                              {req.contactName}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 border ${
                            isPending
                              ? "bg-[#FFF8E1] text-[#B78103] border-[#FFE082]"
                              : isApproved
                              ? "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]"
                              : "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      {/* Contact Details */}
                      <div className="space-y-1.5 text-xs text-[#554F4B] mb-3">
                        <div className="flex items-center gap-2">
                          <FiMail className="text-[#A39A94] shrink-0 text-xs" />
                          <span className="truncate">{req.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiPhone className="text-[#A39A94] shrink-0 text-xs" />
                          <span>{req.phone || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-[#A39A94] shrink-0 text-xs" />
                          <span className="truncate">{req.location || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#817B77]">
                          <FiCalendar className="text-[#A39A94] shrink-0" />
                          <span>Submitted on {submittedDate}</span>
                        </div>
                      </div>

                      {/* Requested Services */}
                      {req.services && req.services.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#817B77] mb-1.5">
                            <FiLayers className="text-xs" />
                            <span>Requested Services</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {req.services.map((svc, idx) => (
                              <span
                                key={idx}
                                className="bg-[#FAF7F5] border border-[#E8E2DE] text-[#554F4B] text-[10px] px-2 py-0.5 rounded-md font-medium"
                              >
                                {svc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description (if present) */}
                      {req.description && (
                        <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-2.5 text-[11px] text-[#6E6763] mb-3">
                          <div className="flex items-center gap-1 font-semibold text-[#817B77] mb-0.5">
                            <FiFileText className="text-[10px]" />
                            <span>Company Notes</span>
                          </div>
                          <p className="italic line-clamp-2">{req.description}</p>
                        </div>
                      )}

                      {/* Rejection Reason (if rejected) */}
                      {isRejected && req.rejectionReason && (
                        <div className="bg-[#FFEBEE]/60 border border-[#FFCDD2] rounded-xl p-2.5 text-[11px] text-[#C62828] mb-3">
                          <span className="font-semibold block mb-0.5">Rejection Reason:</span>
                          <p>{req.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons for PENDING requests */}
                    {isPending && (
                      <div className="pt-3 border-t border-[#F0EBE8] flex items-center justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => handleOpenRejectDialog(req)}
                          disabled={isProcessingAction}
                          className="px-3.5 py-1.5 rounded-xl border border-[#C62828]/30 text-[#C62828] hover:bg-[#FFEBEE] text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          <FiXCircle className="text-xs" />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenApproveDialog(req)}
                          disabled={isProcessingAction}
                          className="px-4 py-1.5 rounded-xl bg-[#2E7D32] hover:bg-[#256829] text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors disabled:opacity-50"
                        >
                          <FiCheck className="text-xs" />
                          <span>Approve</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#E8E2DE] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#817B77]">
            Showing {filteredRequests.length} of {requests.length} requests
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[#E8E2DE] text-xs font-semibold text-[#554F4B] hover:bg-[#FAF7F5] transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Approve Confirmation Sub-Modal */}
      {selectedRequestForApprove && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-[#E8E2DE] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DE]">
              <div className="flex items-center gap-2 text-[#2E7D32]">
                <FiCheckCircle className="text-lg" />
                <h3 className="text-sm font-bold text-[#3E3734]">Confirm Vendor Approval</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequestForApprove(null)}
                disabled={isProcessingAction}
                className="text-[#817B77] hover:text-[#3E3734]"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#554F4B]">
              <p>
                You are about to approve and onboard <strong>{selectedRequestForApprove.companyName}</strong>.
              </p>

              <div className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3 space-y-1">
                <div><strong>Contact:</strong> {selectedRequestForApprove.contactName}</div>
                <div><strong>Email:</strong> {selectedRequestForApprove.email}</div>
                <div><strong>Location:</strong> {selectedRequestForApprove.location}</div>
              </div>

              {/* Subscription Plan Picker */}
              {plans.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#3E3734] mb-1">
                    Subscription Plan Assignment
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    disabled={isProcessingAction}
                    className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3 py-1.5 text-xs text-[#3E3734] outline-none"
                  >
                    {plans.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} — ${p.monthlyPrice}/mo ({p.billingInterval || "MONTHLY"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Duration in Months */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#3E3734] mb-1">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    disabled={isProcessingAction}
                    className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3 py-1.5 text-xs text-[#3E3734] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#3E3734] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isProcessingAction}
                    className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3 py-1.5 text-xs text-[#3E3734] outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#E8F5E9]/60 border border-[#C8E6C9] rounded-xl p-2.5 text-[11px] text-[#2E7D32]">
                Approval will provision the vendor profile, link the subscription, and dispatch an invitation email containing a registration OTP to <strong>{selectedRequestForApprove.email}</strong>.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8E2DE]">
              <button
                type="button"
                onClick={() => setSelectedRequestForApprove(null)}
                disabled={isProcessingAction}
                className="px-3.5 py-1.5 rounded-xl border border-[#E8E2DE] text-xs font-semibold text-[#554F4B] hover:bg-[#FAF7F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={isProcessingAction}
                className="px-4 py-1.5 rounded-xl bg-[#2E7D32] hover:bg-[#256829] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isProcessingAction ? (
                  <>
                    <FiLoader className="animate-spin text-xs" />
                    <span>Provisioning Vendor...</span>
                  </>
                ) : (
                  <span>Confirm Approval</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Sub-Modal */}
      {selectedRequestForReject && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-[#E8E2DE] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DE]">
              <div className="flex items-center gap-2 text-[#C62828]">
                <FiSlash className="text-base" />
                <h3 className="text-sm font-bold text-[#3E3734]">Confirm Vendor Rejection</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequestForReject(null)}
                disabled={isProcessingAction}
                className="text-[#817B77] hover:text-[#3E3734]"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#554F4B]">
              <p>
                Are you sure you want to reject the registration request for <strong>{selectedRequestForReject.companyName}</strong>?
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-[#3E3734] mb-1">
                  Rejection Reason <span className="text-[#817B77] font-normal">(Optional)</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Service coverage not currently supported in this area, or incomplete documentation."
                  rows={3}
                  disabled={isProcessingAction}
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-2.5 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC] resize-none"
                />
              </div>

              <div className="bg-[#FFEBEE]/60 border border-[#FFCDD2] rounded-xl p-2.5 text-[11px] text-[#C62828]">
                No vendor or user account will be created. A rejection notification email will be sent to <strong>{selectedRequestForReject.email}</strong> with resubmission guidance.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8E2DE]">
              <button
                type="button"
                onClick={() => setSelectedRequestForReject(null)}
                disabled={isProcessingAction}
                className="px-3.5 py-1.5 rounded-xl border border-[#E8E2DE] text-xs font-semibold text-[#554F4B] hover:bg-[#FAF7F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isProcessingAction}
                className="px-4 py-1.5 rounded-xl bg-[#C62828] hover:bg-[#A32222] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isProcessingAction ? (
                  <>
                    <FiLoader className="animate-spin text-xs" />
                    <span>Processing Rejection...</span>
                  </>
                ) : (
                  <span>Confirm Rejection</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveVendorModal;
