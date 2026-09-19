import { useState } from "react";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import {
  FiMoreHorizontal,
  FiEye,
  FiEdit2,
  FiCheckCircle,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";

const InvoiceTable = ({
  invoices = [],
  onUpdateStatus,
  onEditInvoice,
  isReadOnly = false,
}) => {
  // Action Menu State per row
  const [activeMenuId, setActiveMenuId] = useState(null);

  // View Modal State
  const [viewInvoice, setViewInvoice] = useState(null);

  // Status Modal State
  const [statusInvoice, setStatusInvoice] = useState(null);
  const [newStatus, setNewStatus] = useState("Pending");
  const [statusError, setStatusError] = useState("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  // Edit Modal State
  const [editInvoice, setEditInvoice] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editTax, setEditTax] = useState("");
  const [editError, setEditError] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const toggleMenu = (id) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleOpenView = (invoice) => {
    setActiveMenuId(null);
    setViewInvoice(invoice);
  };

  const handleOpenStatus = (invoice) => {
    setActiveMenuId(null);
    setStatusInvoice(invoice);
    setNewStatus(invoice.status || "Pending");
    setStatusError("");
  };

  const handleOpenEdit = (invoice) => {
    setActiveMenuId(null);
    setEditInvoice(invoice);
    setEditAmount(invoice.amount !== undefined ? String(invoice.amount) : "");
    setEditTax(invoice.tax !== undefined ? String(invoice.tax) : "0");
    setEditError("");
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setStatusError("");
    try {
      setIsSubmittingStatus(true);
      await onUpdateStatus(statusInvoice._id, newStatus);
      setStatusInvoice(null);
    } catch (err) {
      setStatusError(
        err.response?.data?.message || err.message || "Failed to update status."
      );
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!editAmount || isNaN(Number(editAmount)) || Number(editAmount) < 0) {
      setEditError("Please enter a valid amount.");
      return;
    }

    try {
      setIsSubmittingEdit(true);
      await onEditInvoice(editInvoice._id, {
        amount: Number(editAmount),
        tax: Number(editTax || 0),
      });
      setEditInvoice(null);
    } catch (err) {
      setEditError(
        err.response?.data?.message || err.message || "Failed to update invoice."
      );
    } finally {
      setIsSubmittingEdit(false);
    }
  };

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

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F2EBE5] bg-[#FAF7F5] text-[10px] font-bold tracking-wider text-[#A39A94] uppercase">
              <th className="py-3.5 px-6 font-semibold">INVOICE ID</th>
              <th className="py-3.5 px-6 font-semibold">VENDOR</th>
              <th className="py-3.5 px-6 font-semibold">PROJECT</th>
              <th className="py-3.5 px-6 font-semibold">AMOUNT</th>
              <th className="py-3.5 px-6 font-semibold">TAX</th>
              <th className="py-3.5 px-6 font-semibold">STATUS</th>
              <th className="py-3.5 px-6 font-semibold">PAYMENT DATE</th>
              <th className="py-3.5 px-6 w-12 text-right"></th>
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
                const formattedAmount =
                  typeof row.amount === "number"
                    ? `$${row.amount.toLocaleString()}`
                    : row.amount || "$0";
                const formattedTax =
                  typeof row.tax === "number"
                    ? `$${row.tax.toLocaleString()}`
                    : row.tax || "$0";

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

                    {/* Project & Project ID Stacked */}
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-[#3E3734]">
                        {pTitle}
                      </div>
                      {pCode && pCode !== "—" && (
                        <div className="text-[10px] font-medium text-[#9E9792] mt-0.5">
                          {pCode}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-6 font-bold text-[#3E3734]">
                      {formattedAmount}
                    </td>

                    {/* Tax */}
                    <td className="py-3.5 px-6 text-[#6E6763] font-medium">
                      {formattedTax}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-6">
                      <InvoiceStatusBadge status={row.status} />
                    </td>

                    {/* Payment Date */}
                    <td className="py-3.5 px-6 text-[#6E6763] font-medium">
                      {formatDate(row.paymentDate)}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-6 text-right relative">
                      <button
                        onClick={() => toggleMenu(row._id || invId)}
                        className="text-[#A39A94] hover:text-[#3E3734] p-1.5 rounded-lg hover:bg-[#EAE4DF]/60 transition-colors"
                      >
                        <FiMoreHorizontal className="text-base" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === (row._id || invId) && (
                        <div className="absolute right-6 top-10 z-30 bg-white border border-[#E8E2DE] rounded-xl shadow-lg py-1 w-36 text-left text-xs font-semibold animate-fade-in">
                          <button
                            onClick={() => handleOpenView(row)}
                            className="w-full px-3 py-2 text-[#3E3734] hover:bg-[#FAF7F5] flex items-center gap-2"
                          >
                            <FiEye className="text-xs text-[#817B77]" />
                            <span>View Details</span>
                          </button>
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={() => handleOpenStatus(row)}
                                className="w-full px-3 py-2 text-[#3E3734] hover:bg-[#FAF7F5] flex items-center gap-2 border-t border-[#F2EBE5]"
                              >
                                <FiCheckCircle className="text-xs text-[#817B77]" />
                                <span>Change Status</span>
                              </button>
                              <button
                                onClick={() => handleOpenEdit(row)}
                                className="w-full px-3 py-2 text-[#3E3734] hover:bg-[#FAF7F5] flex items-center gap-2 border-t border-[#F2EBE5]"
                              >
                                <FiEdit2 className="text-xs text-[#817B77]" />
                                <span>Edit Amount</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 px-6 text-center text-[#817B77]"
                >
                  <p className="text-sm font-semibold">No invoices found</p>
                  <p className="text-xs mt-1">
                    Try adjusting your search query or filter settings.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E8E2DE] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#3E3734]">
                  Invoice {viewInvoice.invoiceId}
                </h3>
                <p className="text-xs text-[#817B77]">
                  Created {formatDate(viewInvoice.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setViewInvoice(null)}
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold text-[#817B77]">Vendor:</span>{" "}
                <p className="text-[#3E3734] font-medium mt-0.5">
                  {viewInvoice.vendorName || viewInvoice.vendorId?.companyName || "—"}
                </p>
              </div>
              <div>
                <span className="font-semibold text-[#817B77]">Project:</span>{" "}
                <p className="text-[#3E3734] font-medium mt-0.5">
                  {viewInvoice.projectTitle || viewInvoice.projectId?.projectName || "—"}
                </p>
              </div>
              <div>
                <span className="font-semibold text-[#817B77]">Amount:</span>{" "}
                <p className="text-[#3E3734] font-bold mt-0.5">
                  ${Number(viewInvoice.amount || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="font-semibold text-[#817B77]">Tax:</span>{" "}
                <p className="text-[#3E3734] font-medium mt-0.5">
                  ${Number(viewInvoice.tax || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="font-semibold text-[#817B77]">Total Amount:</span>{" "}
                <p className="text-[#2E7D32] font-bold mt-0.5">
                  ${Number(viewInvoice.totalAmount || (Number(viewInvoice.amount || 0) + Number(viewInvoice.tax || 0))).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="font-semibold text-[#817B77]">Payment Date:</span>{" "}
                <p className="text-[#3E3734] font-medium mt-0.5">
                  {formatDate(viewInvoice.paymentDate)}
                </p>
              </div>
              <div className="col-span-2 flex items-center gap-2 pt-2 border-t border-[#F2EBE5]">
                <span className="font-semibold text-[#817B77]">Status:</span>
                <InvoiceStatusBadge status={viewInvoice.status} />
              </div>
            </div>

            <div className="pt-3 border-t border-[#F2EBE5] flex justify-end">
              <button
                onClick={() => setViewInvoice(null)}
                className="bg-[#F2EBE5] text-[#3E3734] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#EAE4DF] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStatus}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E8E2DE] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
              <h3 className="text-sm font-bold text-[#3E3734]">
                Change Invoice Status
              </h3>
              <button
                type="button"
                onClick={() => setStatusInvoice(null)}
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <p className="text-xs text-[#817B77]">
              Invoice: <span className="font-semibold text-[#3E3734]">{statusInvoice.invoiceId}</span>
            </p>

            {statusError && (
              <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{statusError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1">
                Select Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC]"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div className="pt-3 border-t border-[#F2EBE5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStatusInvoice(null)}
                disabled={isSubmittingStatus}
                className="bg-white border border-[#E8E2DE] text-[#6E6763] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#F2EBE5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingStatus}
                className="bg-[#8A817C] text-white font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#6E6763] transition-colors disabled:opacity-50"
              >
                {isSubmittingStatus ? "Updating..." : "Save Status"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {editInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E8E2DE] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
              <h3 className="text-sm font-bold text-[#3E3734]">
                Edit Invoice Amounts
              </h3>
              <button
                type="button"
                onClick={() => setEditInvoice(null)}
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <p className="text-xs text-[#817B77]">
              Invoice: <span className="font-semibold text-[#3E3734]">{editInvoice.invoiceId}</span>
            </p>

            {editError && (
              <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1">
                Amount ($) <span className="text-[#C62828]">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1">
                Tax ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editTax}
                onChange={(e) => setEditTax(e.target.value)}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC]"
              />
            </div>

            <p className="text-[11px] text-[#817B77] italic">
              Total Amount will automatically be computed by backend as Amount + Tax.
            </p>

            <div className="pt-3 border-t border-[#F2EBE5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditInvoice(null)}
                disabled={isSubmittingEdit}
                className="bg-white border border-[#E8E2DE] text-[#6E6763] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#F2EBE5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingEdit}
                className="bg-[#8A817C] text-white font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#6E6763] transition-colors disabled:opacity-50"
              >
                {isSubmittingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
