import { useState } from "react";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import {
  FiEye,
  FiEdit2,
  FiDownload,
  FiLoader,
  FiCheckCircle,
  FiXCircle,
  FiSend,
  FiDollarSign,
  FiX,
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiFileText,
  FiUser,
  FiBriefcase,
  FiCalendar,
  FiMail,
} from "react-icons/fi";

const InvoiceTable = ({
  invoices = [],
  onReviewInvoice,
  onSendInvoice,
  onRecordPayment,
  onDownloadPdf,
  isReadOnly = false,
}) => {
  // View Details Modal State
  const [viewInvoice, setViewInvoice] = useState(null);

  // Review Modal State (Approve / Reject)
  const [reviewModalInvoice, setReviewModalInvoice] = useState(null);
  const [reviewAction, setReviewAction] = useState("APPROVE"); // "APPROVE" | "REJECT"
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Send Invoice Modal State
  const [sendModalInvoice, setSendModalInvoice] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendError, setSendError] = useState("");
  const [isSubmittingSend, setIsSubmittingSend] = useState(false);

  // Record Payment Modal State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // PDF Downloading indicator
  const [downloadingId, setDownloadingId] = useState(null);

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "—") return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Handler: Open View Details
  const handleOpenView = (invoice) => {
    setViewInvoice(invoice);
  };

  // Handler: Open Review Modal
  const handleOpenReview = (invoice, defaultAction = "APPROVE") => {
    setReviewModalInvoice(invoice);
    setReviewAction(defaultAction);
    setRejectionReason("");
    setReviewError("");
  };

  // Handler: Submit Review (Approve or Reject)
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalInvoice || !onReviewInvoice) return;
    setReviewError("");

    if (reviewAction === "REJECT" && !rejectionReason.trim()) {
      setReviewError("Please provide a reason for rejecting this invoice.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      await onReviewInvoice(reviewModalInvoice._id, {
        action: reviewAction,
        rejectionReason: reviewAction === "REJECT" ? rejectionReason.trim() : undefined,
      });

      // Close modal and detail view if open
      setReviewModalInvoice(null);
      if (viewInvoice && viewInvoice._id === reviewModalInvoice._id) {
        setViewInvoice(null);
      }
    } catch (err) {
      setReviewError(
        err.response?.data?.message || err.message || "Failed to submit review action."
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handler: Open Send Modal
  const handleOpenSend = (invoice) => {
    setSendModalInvoice(invoice);

    // Resolve client email from project data or previously sent address
    const clientCandidate =
      invoice.projectId?.clientEmail ||
      (invoice.projectId?.client && invoice.projectId.client.includes("@")
        ? invoice.projectId.client
        : "") ||
      invoice.sentTo ||
      "";

    setRecipientEmail(clientCandidate);
    setSendError("");
  };

  // Handler: Submit Send
  const handleSubmitSend = async (e) => {
    e.preventDefault();
    if (!sendModalInvoice || !onSendInvoice) return;
    setSendError("");

    const emailTrimmed = recipientEmail.trim();
    if (!emailTrimmed) {
      setSendError("Recipient email address is required.");
      return;
    }
    if (!emailTrimmed.includes("@") || !emailTrimmed.includes(".")) {
      setSendError("Please enter a valid email address (e.g., client@example.com).");
      return;
    }

    try {
      setIsSubmittingSend(true);
      await onSendInvoice(sendModalInvoice._id, {
        recipientEmail: emailTrimmed,
      });

      setSendModalInvoice(null);
      if (viewInvoice && viewInvoice._id === sendModalInvoice._id) {
        setViewInvoice(null);
      }
    } catch (err) {
      setSendError(
        err.response?.data?.message || err.message || "Failed to send invoice to client."
      );
    } finally {
      setIsSubmittingSend(false);
    }
  };

  // Handler: Open Payment Modal
  const handleOpenPayment = (invoice) => {
    setPaymentModalInvoice(invoice);

    // Default to today's date in YYYY-MM-DD
    const todayStr = new Date().toISOString().split("T")[0];
    setPaymentDate(todayStr);
    setPaymentMethod("Bank Transfer");
    setPaymentNotes("");
    setPaymentError("");
  };

  // Handler: Submit Payment
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!paymentModalInvoice || !onRecordPayment) return;
    setPaymentError("");

    try {
      setIsSubmittingPayment(true);
      await onRecordPayment(paymentModalInvoice._id, {
        paymentDate: paymentDate || new Date().toISOString(),
        paymentMethod: paymentMethod.trim() || "Bank Transfer",
        paymentNotes: paymentNotes.trim(),
      });

      setPaymentModalInvoice(null);
      if (viewInvoice && viewInvoice._id === paymentModalInvoice._id) {
        setViewInvoice(null);
      }
    } catch (err) {
      setPaymentError(
        err.response?.data?.message || err.message || "Failed to record payment."
      );
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Handler: Download PDF
  const handleDownloadPdfClick = async (invoice) => {
    if (!onDownloadPdf) return;
    setDownloadingId(invoice._id);
    try {
      await onDownloadPdf(invoice);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F2EBE5] bg-[#FAF7F5] text-[10px] font-bold tracking-wider text-[#A39A94] uppercase">
              <th className="py-3.5 px-6 font-semibold">INVOICE ID</th>
              <th className="py-3.5 px-6 font-semibold">VENDOR</th>
              <th className="py-3.5 px-6 font-semibold">PROJECT</th>
              <th className="py-3.5 px-6 font-semibold">INVOICE DATE</th>
              <th className="py-3.5 px-6 font-semibold">DUE DATE</th>
              <th className="py-3.5 px-6 font-semibold">TOTAL AMOUNT</th>
              <th className="py-3.5 px-6 font-semibold">STATUS</th>
              <th className="py-3.5 px-6 text-right font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F4F2] text-xs">
            {invoices.length > 0 ? (
              invoices.map((row) => {
                const invId = row.invoiceId || row.id || row._id;
                const vName =
                  row.vendorName ||
                  row.vendorId?.companyName ||
                  row.vendor ||
                  "—";
                const pTitle =
                  row.projectTitle ||
                  row.projectId?.projectName ||
                  row.project ||
                  "—";
                const pCode =
                  row.projectId?.projectId ||
                  (typeof row.projectId === "string" ? row.projectId : "—");

                const totalVal =
                  typeof row.totalAmount === "number"
                    ? row.totalAmount
                    : typeof row.amount === "number"
                    ? row.amount
                    : Number(row.totalAmount || row.amount || 0);

                const isReviewable = !isReadOnly && ["Submitted", "Pending"].includes(row.status);
                const isPdfEligible = Boolean(
                  onDownloadPdf &&
                    ["Submitted", "Pending", "Approved", "Sent", "Paid", "Rejected"].includes(row.status)
                );

                return (
                  <tr
                    key={row._id || invId}
                    className="hover:bg-[#FAF7F5] transition-colors relative"
                  >
                    {/* Invoice ID */}
                    <td className="py-3.5 px-6 font-bold text-[#3E3734]">
                      {invId}
                    </td>

                    {/* Vendor */}
                    <td className="py-3.5 px-6 font-semibold text-[#4A423F]">
                      {vName}
                    </td>

                    {/* Project & Code */}
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-[#3E3734] line-clamp-1">
                        {pTitle}
                      </div>
                      {pCode && pCode !== "—" && (
                        <div className="text-[10px] font-medium text-[#9E9792] mt-0.5">
                          {pCode}
                        </div>
                      )}
                    </td>

                    {/* Invoice Date */}
                    <td className="py-3.5 px-6 text-[#6E6763] font-medium">
                      {formatDate(row.invoiceDate || row.createdAt)}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-6 text-[#6E6763] font-medium">
                      {formatDate(row.dueDate)}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-6 font-bold text-[#3E3734]">
                      ${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-6">
                      <InvoiceStatusBadge status={row.status} />
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1. View Invoice */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenView(row);
                          }}
                          aria-label="View invoice"
                          title="View invoice"
                          className="p-1.5 rounded-lg text-[#6E6763] hover:text-[#2D3436] hover:bg-[#FAF7F5] focus:outline-none focus:ring-2 focus:ring-[#817B77]/30 transition-colors cursor-pointer"
                        >
                          <FiEye className="text-sm shrink-0" />
                        </button>

                        {/* 2. Download Invoice */}
                        {isPdfEligible && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPdfClick(row);
                            }}
                            disabled={downloadingId === row._id}
                            aria-label={
                              downloadingId === row._id
                                ? "Downloading invoice..."
                                : "Download invoice"
                            }
                            aria-busy={downloadingId === row._id}
                            title={
                              downloadingId === row._id
                                ? "Downloading invoice..."
                                : "Download invoice"
                            }
                            className="p-1.5 rounded-lg text-[#6E6763] hover:text-[#1565C0] hover:bg-[#E3F2FD]/60 focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {downloadingId === row._id ? (
                              <FiLoader className="text-sm shrink-0 animate-spin text-[#1565C0]" />
                            ) : (
                              <FiDownload className="text-sm shrink-0" />
                            )}
                          </button>
                        )}

                        {/* 3. Review / Edit Invoice */}
                        {isReviewable && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReview(row, "APPROVE");
                            }}
                            aria-label="Review invoice"
                            title="Review invoice"
                            className="p-1.5 rounded-lg text-[#6E6763] hover:text-[#D97706] hover:bg-[#FEF3C7]/60 focus:outline-none focus:ring-2 focus:ring-[#D97706]/30 transition-colors cursor-pointer"
                          >
                            <FiEdit2 className="text-sm shrink-0" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 px-6 text-center text-[#817B77]">
                  <p className="text-sm font-semibold text-[#3E3734]">No invoices found</p>
                  <p className="text-xs mt-1">
                    Try adjusting your search query or filter settings.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 1. VIEW INVOICE DETAILS MODAL */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E8E2DE] space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#F2EBE5] pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-[#3E3734]">
                    Invoice {viewInvoice.invoiceId}
                  </h3>
                  <InvoiceStatusBadge status={viewInvoice.status} />
                </div>
                <p className="text-xs text-[#817B77] mt-1">
                  Issued: {formatDate(viewInvoice.invoiceDate || viewInvoice.createdAt)} • Due: {formatDate(viewInvoice.dueDate)}
                </p>
              </div>
              <button
                onClick={() => setViewInvoice(null)}
                className="text-[#817B77] hover:text-[#3E3734] p-1.5 rounded-xl hover:bg-[#FAF7F5] transition-colors"
                aria-label="Close"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Rejection Alert if rejected */}
            {viewInvoice.status === "Rejected" && viewInvoice.rejectionReason && (
              <div className="bg-[#FFEBEE] border border-[#C62828]/20 rounded-2xl p-4 text-xs text-[#C62828] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <FiAlertCircle className="text-sm" />
                  <span>Invoice Rejection Reason</span>
                </div>
                <p className="text-[#3E3734] font-medium pl-5">
                  {viewInvoice.rejectionReason}
                </p>
              </div>
            )}

            {/* Vendor & Project Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vendor Box */}
              <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#817B77] uppercase text-[10px] tracking-wider">
                  <FiUser className="text-xs" />
                  <span>Vendor Information</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#3E3734] text-sm">
                    {viewInvoice.vendorName || viewInvoice.vendorId?.companyName || "—"}
                  </h4>
                  {viewInvoice.vendorId?.contactName && (
                    <p className="text-[#6E6763] font-medium mt-0.5">
                      Contact: {viewInvoice.vendorId.contactName}
                    </p>
                  )}
                  {viewInvoice.vendorId?.location && (
                    <p className="text-[#817B77] text-[11px] mt-0.5">
                      {viewInvoice.vendorId.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Project Box */}
              <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#817B77] uppercase text-[10px] tracking-wider">
                  <FiBriefcase className="text-xs" />
                  <span>Project Details</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#3E3734] text-sm">
                    {viewInvoice.projectTitle || viewInvoice.projectId?.projectName || "—"}
                  </h4>
                  <p className="text-[#6E6763] font-medium mt-0.5">
                    Code: {viewInvoice.projectId?.projectId || "—"}
                  </p>
                  <p className="text-[#817B77] text-[11px] mt-0.5">
                    Client: {viewInvoice.projectId?.client || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Itemized Line Items Table */}
            <div>
              <h4 className="text-xs font-bold text-[#3E3734] mb-2 flex items-center gap-1.5">
                <FiFileText className="text-xs text-[#817B77]" />
                <span>Line Items</span>
              </h4>
              <div className="border border-[#E8E2DE] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F5] border-b border-[#F2EBE5] text-[10px] font-bold text-[#817B77] uppercase">
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right w-16">Qty</th>
                      <th className="py-2.5 px-3 text-right w-24">Rate</th>
                      <th className="py-2.5 px-3 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F4F2]">
                    {Array.isArray(viewInvoice.items) && viewInvoice.items.length > 0 ? (
                      viewInvoice.items.map((item, idx) => (
                        <tr key={item._id || idx}>
                          <td className="py-2.5 px-3 font-medium text-[#3E3734]">
                            {item.description}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#6E6763]">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#6E6763]">
                            ${Number(item.rate || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#3E3734]">
                            ${Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-[#3E3734]">
                          {viewInvoice.projectTitle || "Field Services"}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#6E6763]">1</td>
                        <td className="py-2.5 px-3 text-right text-[#6E6763]">
                          ${Number(viewInvoice.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#3E3734]">
                          ${Number(viewInvoice.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary */}
              <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-4 space-y-2 mt-3">
                <div className="flex items-center justify-between text-xs text-[#817B77]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#3E3734]">
                    ${Number(viewInvoice.subtotal ?? viewInvoice.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#817B77]">
                  <span>Tax (Fixed 0%)</span>
                  <span className="font-semibold text-[#3E3734]">$0.00</span>
                </div>
                <div className="pt-2 border-t border-[#E8E2DE] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3E3734]">Total Amount</span>
                  <span className="text-base font-bold text-[#2E7D32]">
                    ${Number(viewInvoice.totalAmount ?? viewInvoice.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes if present */}
            {viewInvoice.notes && (
              <div className="text-xs">
                <span className="font-bold text-[#817B77]">Notes:</span>
                <p className="text-[#3E3734] bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-3 mt-1 font-medium whitespace-pre-wrap">
                  {viewInvoice.notes}
                </p>
              </div>
            )}

            {/* Sent or Payment Details if applicable */}
            {(viewInvoice.sentTo || viewInvoice.paymentDate) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F2EBE5] text-xs">
                {viewInvoice.sentTo && (
                  <div className="bg-[#F3E8FF]/40 border border-[#7E22CE]/10 rounded-xl p-3">
                    <span className="font-bold text-[#7E22CE] flex items-center gap-1">
                      <FiMail className="text-xs" /> Sent to Client
                    </span>
                    <p className="text-[#3E3734] font-medium mt-1 truncate">
                      {viewInvoice.sentTo}
                    </p>
                    <p className="text-[10px] text-[#817B77] mt-0.5">
                      {formatDateTime(viewInvoice.sentAt)}
                    </p>
                  </div>
                )}

                {viewInvoice.paymentDate && (
                  <div className="bg-[#E8F5E9]/50 border border-[#2E7D32]/10 rounded-xl p-3">
                    <span className="font-bold text-[#2E7D32] flex items-center gap-1">
                      <FiCheckCircle className="text-xs" /> Payment Recorded
                    </span>
                    <p className="text-[#3E3734] font-medium mt-1">
                      Method: {viewInvoice.paymentMethod || "Bank Transfer"}
                    </p>
                    <p className="text-[10px] text-[#817B77] mt-0.5">
                      Paid: {formatDate(viewInvoice.paymentDate)}
                    </p>
                    {viewInvoice.paymentNotes && (
                      <p className="text-[10px] text-[#6E6763] mt-1 italic">
                        {viewInvoice.paymentNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Review History Timeline */}
            {Array.isArray(viewInvoice.reviewHistory) && viewInvoice.reviewHistory.length > 0 && (
              <div className="pt-2 border-t border-[#F2EBE5]">
                <h4 className="text-xs font-bold text-[#3E3734] mb-2 flex items-center gap-1.5">
                  <FiClock className="text-xs text-[#817B77]" />
                  <span>Activity & Review History</span>
                </h4>
                <div className="space-y-2">
                  {viewInvoice.reviewHistory.map((hist, idx) => (
                    <div
                      key={hist._id || idx}
                      className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-2.5 text-xs flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#3E3734] text-[11px]">
                            {hist.action}
                          </span>
                          <span className="text-[10px] text-[#817B77]">
                            by {hist.actorEmail || hist.actorRole || "User"}
                          </span>
                        </div>
                        {hist.reason && (
                          <p className="text-[#6E6763] text-[11px] mt-1 font-medium">
                            {hist.reason}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-[#A39A94] shrink-0 font-medium">
                        {formatDateTime(hist.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer with Actions */}
            <div className="pt-4 border-t border-[#F2EBE5] flex flex-wrap items-center justify-between gap-2">
              <div>
                {["Approved", "Sent", "Paid", "Submitted"].includes(viewInvoice.status) && (
                  <button
                    onClick={() => handleDownloadPdfClick(viewInvoice)}
                    disabled={downloadingId === viewInvoice._id}
                    className="bg-white border border-[#E8E2DE] hover:bg-[#FAF7F5] text-[#3E3734] text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <FiDownload className="text-xs text-[#817B77]" />
                    <span>
                      {downloadingId === viewInvoice._id ? "Downloading..." : "Download PDF"}
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isReadOnly && ["Submitted", "Pending"].includes(viewInvoice.status) && (
                  <>
                    <button
                      onClick={() => handleOpenReview(viewInvoice, "REJECT")}
                      className="bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <FiXCircle className="text-xs" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleOpenReview(viewInvoice, "APPROVE")}
                      className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <FiCheck className="text-xs" />
                      <span>Approve</span>
                    </button>
                  </>
                )}

                {!isReadOnly && viewInvoice.status === "Approved" && (
                  <button
                    onClick={() => handleOpenSend(viewInvoice)}
                    className="bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <FiSend className="text-xs" />
                    <span>Send to Client</span>
                  </button>
                )}

                {!isReadOnly && ["Sent", "Pending"].includes(viewInvoice.status) && (
                  <button
                    onClick={() => handleOpenPayment(viewInvoice)}
                    className="bg-[#8A817C] hover:bg-[#6E6763] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <FiDollarSign className="text-xs" />
                    <span>Record Payment</span>
                  </button>
                )}

                <button
                  onClick={() => setViewInvoice(null)}
                  className="bg-[#F2EBE5] text-[#3E3734] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#EAE4DF] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REVIEW INVOICE MODAL (APPROVE / REJECT) */}
      {reviewModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitReview}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2DE] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
              <h3 className="text-sm font-bold text-[#3E3734]">
                Review Invoice {reviewModalInvoice.invoiceId}
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalInvoice(null)}
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {reviewError && (
              <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-3 text-xs space-y-1">
              <p>
                <span className="font-semibold text-[#817B77]">Vendor:</span>{" "}
                <span className="text-[#3E3734] font-bold">
                  {reviewModalInvoice.vendorName || reviewModalInvoice.vendorId?.companyName || "—"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-[#817B77]">Project:</span>{" "}
                <span className="text-[#3E3734]">
                  {reviewModalInvoice.projectTitle || reviewModalInvoice.projectId?.projectName || "—"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-[#817B77]">Total Amount:</span>{" "}
                <span className="text-[#2E7D32] font-bold">
                  ${Number(reviewModalInvoice.totalAmount || reviewModalInvoice.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>

            {/* Action Selector */}
            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-2">
                Decision
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAction("APPROVE")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    reviewAction === "APPROVE"
                      ? "bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32] shadow-xs"
                      : "bg-white border-[#E8E2DE] text-[#817B77] hover:bg-[#FAF7F5]"
                  }`}
                >
                  <FiCheck className="text-xs" />
                  <span>Approve</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewAction("REJECT")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    reviewAction === "REJECT"
                      ? "bg-[#FFEBEE] border-[#C62828] text-[#C62828] shadow-xs"
                      : "bg-white border-[#E8E2DE] text-[#817B77] hover:bg-[#FAF7F5]"
                  }`}
                >
                  <FiXCircle className="text-xs" />
                  <span>Reject</span>
                </button>
              </div>
            </div>

            {/* Rejection Reason Textarea (Conditional) */}
            {reviewAction === "REJECT" && (
              <div>
                <label className="block text-xs font-bold text-[#3E3734] mb-1">
                  Rejection Reason <span className="text-[#C62828]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this invoice is being rejected so the vendor can rectify and resubmit..."
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors leading-relaxed"
                  required
                />
              </div>
            )}

            <div className="pt-3 border-t border-[#F2EBE5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewModalInvoice(null)}
                disabled={isSubmittingReview}
                className="bg-white border border-[#E8E2DE] text-[#6E6763] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#F2EBE5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview}
                className={`text-white font-semibold text-xs px-5 py-2 rounded-xl transition-colors shadow-xs disabled:opacity-50 ${
                  reviewAction === "APPROVE"
                    ? "bg-[#2E7D32] hover:bg-[#1B5E20]"
                    : "bg-[#C62828] hover:bg-[#B71C1C]"
                }`}
              >
                {isSubmittingReview
                  ? "Processing..."
                  : reviewAction === "APPROVE"
                  ? "Confirm Approval"
                  : "Reject Invoice"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. SEND INVOICE MODAL */}
      {sendModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitSend}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2DE] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
              <h3 className="text-sm font-bold text-[#3E3734]">
                Send Invoice {sendModalInvoice.invoiceId}
              </h3>
              <button
                type="button"
                onClick={() => setSendModalInvoice(null)}
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {sendError && (
              <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{sendError}</span>
              </div>
            )}

            <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-3 text-xs space-y-1">
              <p>
                <span className="font-semibold text-[#817B77]">Project:</span>{" "}
                <span className="text-[#3E3734] font-medium">
                  {sendModalInvoice.projectTitle || sendModalInvoice.projectId?.projectName || "—"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-[#817B77]">Total Amount:</span>{" "}
                <span className="text-[#2E7D32] font-bold">
                  ${Number(sendModalInvoice.totalAmount || sendModalInvoice.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1">
                Recipient Email Address <span className="text-[#C62828]">*</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="e.g., client@example.com"
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC] transition-colors"
                  required
                />
              </div>
              <p className="text-[11px] text-[#817B77] mt-1.5 leading-relaxed">
                The approved invoice PDF will be sent to this client address.
              </p>
            </div>

            <div className="pt-3 border-t border-[#F2EBE5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSendModalInvoice(null)}
                disabled={isSubmittingSend}
                className="bg-white border border-[#E8E2DE] text-[#6E6763] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#F2EBE5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingSend}
                className="bg-[#1565C0] hover:bg-[#0D47A1] text-white font-semibold text-xs px-5 py-2 rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <FiSend className="text-xs" />
                <span>{isSubmittingSend ? "Sending..." : "Send Invoice"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. RECORD PAYMENT MODAL */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitPayment}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2DE] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
              <h3 className="text-sm font-bold text-[#3E3734]">
                Record Payment
              </h3>
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {paymentError && (
              <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-3 text-xs space-y-1">
              <p>
                <span className="font-semibold text-[#817B77]">Invoice:</span>{" "}
                <span className="text-[#3E3734] font-bold">
                  {paymentModalInvoice.invoiceId}
                </span>
              </p>
              <p>
                <span className="font-semibold text-[#817B77]">Amount Due:</span>{" "}
                <span className="text-[#2E7D32] font-bold">
                  ${Number(paymentModalInvoice.totalAmount || paymentModalInvoice.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1">
                Payment Date <span className="text-[#C62828]">*</span>
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC] transition-colors cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1">
                Payment Method <span className="text-[#C62828]">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] cursor-pointer"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1">
                Reference / Notes
              </label>
              <textarea
                rows={2}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Transaction ID, check #, or bank reference..."
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-[#F2EBE5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                disabled={isSubmittingPayment}
                className="bg-white border border-[#E8E2DE] text-[#6E6763] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#F2EBE5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingPayment}
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-semibold text-xs px-5 py-2 rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <FiCheck className="text-xs" />
                <span>{isSubmittingPayment ? "Recording..." : "Record Payment"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
