import {
  FiX,
  FiFileText,
  FiBriefcase,
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiClock,
  FiEdit2,
  FiSend,
  FiMail,
} from "react-icons/fi";
import InvoiceStatusBadge from "../../admin/invoices/InvoiceStatusBadge";

const VendorInvoiceDetailModal = ({
  isOpen,
  onClose,
  invoice,
  onEditInvoice,
  onSubmitDraft,
  onDownloadPdf,
  isDownloadingPdf = false,
  isSubmitting = false,
}) => {
  if (!isOpen || !invoice) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
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

  const isDraft = invoice.status === "Draft";
  const isRejected = invoice.status === "Rejected";
  const isSubmitted = invoice.status === "Submitted" || invoice.status === "Pending";
  const isApproved = invoice.status === "Approved";
  const isSent = invoice.status === "Sent";
  const isPaid = invoice.status === "Paid";

  const totalAmountNum = Number(invoice.totalAmount ?? invoice.amount ?? 0);
  const subtotalNum = Number(invoice.subtotal ?? invoice.amount ?? totalAmountNum);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-3xl max-w-2xl w-full p-6 shadow-2xl my-6 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#F2EBE5] pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[#2D3436]">
                Invoice {invoice.invoiceId}
              </h2>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-[#817B77] mt-1">
              Issued: {formatDate(invoice.invoiceDate || invoice.createdAt)} • Due:{" "}
              {formatDate(invoice.dueDate)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#817B77] hover:text-[#2D3436] p-1.5 rounded-xl hover:bg-[#EAE4DF] transition-colors"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Status Specific Notice Banners */}
          {isRejected && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 rounded-2xl p-4 text-xs text-[#C62828] space-y-1 shadow-xs">
              <div className="font-bold flex items-center gap-1.5">
                <FiAlertCircle size={15} />
                <span>Invoice Rejected — Action Required</span>
              </div>
              <p className="text-[#3E3734] font-medium pl-5 leading-relaxed">
                {invoice.rejectionReason || "Please review the requirements and submit updated line items."}
              </p>
            </div>
          )}

          {isDraft && (
            <div className="bg-[#FEF3C7] border border-[#D97706]/20 rounded-2xl p-4 text-xs text-[#D97706] flex items-center gap-2">
              <FiClock size={16} className="shrink-0" />
              <span>
                This invoice is currently in <strong>Draft</strong> status and has not been submitted for Admin review.
              </span>
            </div>
          )}

          {isSubmitted && (
            <div className="bg-[#FEF3C7] border border-[#D97706]/20 rounded-2xl p-4 text-xs text-[#D97706] flex items-center gap-2">
              <FiClock size={16} className="shrink-0" />
              <span>
                This invoice is currently <strong>Awaiting Review</strong> by FieldCam administrators. Line items are locked.
              </span>
            </div>
          )}

          {isApproved && (
            <div className="bg-[#E3F2FD] border border-[#1565C0]/20 rounded-2xl p-4 text-xs text-[#1565C0] flex items-center gap-2">
              <FiCheckCircle size={16} className="shrink-0" />
              <span>
                This invoice has been <strong>Approved</strong> and queued for client dispatch and payout.
              </span>
            </div>
          )}

          {isSent && (
            <div className="bg-[#F3E8FF] border border-[#7E22CE]/20 rounded-2xl p-4 text-xs text-[#7E22CE] flex items-center gap-2">
              <FiMail size={16} className="shrink-0" />
              <span>
                Invoice sent to client {invoice.sentTo ? `(${invoice.sentTo})` : ""} on {formatDate(invoice.sentAt)}.
              </span>
            </div>
          )}

          {isPaid && (
            <div className="bg-[#E8F5E9] border border-[#2E7D32]/20 rounded-2xl p-4 text-xs text-[#2E7D32] flex items-center gap-2">
              <FiCheckCircle size={16} className="shrink-0" />
              <span>
                Payment of <strong>${totalAmountNum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> recorded on {formatDate(invoice.paymentDate)} via {invoice.paymentMethod || "Bank Transfer"}.
              </span>
            </div>
          )}

          {/* Project Details Snapshot */}
          <div className="bg-white rounded-2xl border border-[#E8E2DE] p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#817B77] uppercase text-[10px] tracking-wider">
              <FiBriefcase size={13} />
              <span>Project Details</span>
            </div>
            <div>
              <h4 className="font-bold text-[#2D3436] text-sm">
                {invoice.projectTitle || invoice.projectId?.projectName || "—"}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#817B77] mt-1">
                <p>Code: <span className="text-[#2D3436] font-medium">{invoice.projectId?.projectId || "—"}</span></p>
                <p>Client: <span className="text-[#2D3436] font-medium">{invoice.projectId?.client || "—"}</span></p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white rounded-2xl border border-[#E8E2DE] p-4 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-[#2D3436] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <FiFileText size={13} className="text-[#817B77]" />
              <span>Itemized Line Items</span>
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
                  {Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                    invoice.items.map((item, idx) => (
                      <tr key={item._id || idx}>
                        <td className="py-2.5 px-3 font-medium text-[#2D3436]">
                          {item.description}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#6E6763]">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#6E6763]">
                          ${Number(item.rate || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#2D3436]">
                          ${Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-[#2D3436]">
                        {invoice.projectTitle || "Field Services"}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#6E6763]">1</td>
                      <td className="py-2.5 px-3 text-right text-[#6E6763]">
                        ${totalAmountNum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#2D3436]">
                        ${totalAmountNum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-3.5 space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs text-[#817B77]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#2D3436]">
                  ${subtotalNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#817B77]">
                <span>Tax (Fixed 0%)</span>
                <span className="font-semibold text-[#2D3436]">$0.00</span>
              </div>
              <div className="pt-2 border-t border-[#E8E2DE] flex items-center justify-between">
                <span className="text-xs font-bold text-[#2D3436]">Total Amount</span>
                <span className="text-base font-black text-[#2E7D32]">
                  ${totalAmountNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Notes if present */}
          {invoice.notes && (
            <div className="bg-white rounded-2xl border border-[#E8E2DE] p-4 shadow-xs text-xs">
              <span className="font-bold text-[#817B77]">Notes & Payment Reference:</span>
              <p className="text-[#2D3436] bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-3 mt-1.5 font-medium whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Activity Timeline */}
          {Array.isArray(invoice.reviewHistory) && invoice.reviewHistory.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E8E2DE] p-4 shadow-xs">
              <h4 className="text-xs font-bold text-[#2D3436] mb-3 flex items-center gap-1.5">
                <FiClock size={13} className="text-[#817B77]" />
                <span>Invoice History</span>
              </h4>
              <div className="space-y-2">
                {invoice.reviewHistory.map((hist, idx) => (
                  <div
                    key={hist._id || idx}
                    className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-2.5 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2D3436] text-[11px]">
                          {hist.action}
                        </span>
                        <span className="text-[10px] text-[#817B77]">
                          by {hist.actorEmail || hist.actorRole || "System"}
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
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[#F2EBE5] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div>
            {["Approved", "Sent", "Paid", "Submitted"].includes(invoice.status) && onDownloadPdf && (
              <button
                type="button"
                onClick={() => onDownloadPdf(invoice)}
                disabled={isDownloadingPdf}
                className="bg-white border border-[#E8E2DE] hover:bg-[#FAF7F5] text-[#2D3436] text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FiDownload size={13} className="text-[#817B77]" />
                <span>{isDownloadingPdf ? "Downloading..." : "Download PDF"}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* If Draft: Edit or Submit */}
            {isDraft && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onEditInvoice) onEditInvoice(invoice);
                  }}
                  className="bg-white border border-[#E8E2DE] hover:bg-[#FAF7F5] text-[#2D3436] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <FiEdit2 size={13} />
                  <span>Edit Draft</span>
                </button>
                {onSubmitDraft && (
                  <button
                    type="button"
                    onClick={() => onSubmitDraft(invoice._id)}
                    disabled={isSubmitting}
                    className="bg-[#00B894] hover:bg-[#00A383] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                  >
                    <FiSend size={13} />
                    <span>{isSubmitting ? "Submitting..." : "Submit for Review"}</span>
                  </button>
                )}
              </>
            )}

            {/* If Rejected: Edit & Resubmit */}
            {isRejected && onEditInvoice && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditInvoice(invoice);
                }}
                className="bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FiEdit2 size={13} />
                <span>Edit & Resubmit</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="bg-[#F2EBE5] text-[#2D3436] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#EAE4DF] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorInvoiceDetailModal;
