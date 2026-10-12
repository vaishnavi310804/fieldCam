import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiX,
  FiFileText,
  FiUploadCloud,
  FiPlus,
  FiTrash2,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiCheck,
  FiCalendar,
  FiChevronDown,
  FiLoader,
  FiArrowLeft,
  FiEye,
} from "react-icons/fi";
import {
  getInvoicePreview,
  createInvoice,
  updateInvoice,
} from "../../../services/invoiceService";
import { getProjects } from "../../../services/projectService";

const RaiseInvoiceModal = ({
  isOpen,
  onClose,
  initialProjectId = null,
  existingInvoice = null, // provided when editing a Draft or editing/resubmitting a Rejected invoice
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState("GENERATE"); // "GENERATE" | "UPLOAD"
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Project selection & preview state
  const [vendorProjects, setVendorProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(
    initialProjectId || existingInvoice?.projectId?._id || existingInvoice?.projectId || ""
  );

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewInfo, setPreviewInfo] = useState(null);

  // Form fields
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([
    { id: 1, description: "", quantity: 1, rate: 0, amount: 0 },
  ]);
  const [notes, setNotes] = useState("");

  // Submission state
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(null); // "draft" | "submit"

  const isEditing = Boolean(existingInvoice);
  const isRejected = existingInvoice?.status === "Rejected";
  const isDraft = existingInvoice?.status === "Draft";

  // Load preview data when selectedProjectId changes
  const loadPreview = useCallback(async (projId) => {
    if (!projId) {
      setPreviewInfo(null);
      setPreviewError("");
      return;
    }

    setLoadingPreview(true);
    setPreviewError("");
    try {
      const res = await getInvoicePreview(projId);
      const data = res?.data || res;
      setPreviewInfo(data);

      if (data.eligible && !data.hasExistingInvoice && data.previewData) {
        setInvoiceId(data.previewData.suggestedInvoiceId || "");
        if (data.previewData.suggestedDueDate) {
          const dDate = new Date(data.previewData.suggestedDueDate)
            .toISOString()
            .split("T")[0];
          setDueDate(dDate);
        }
        if (Array.isArray(data.previewData.items) && data.previewData.items.length > 0) {
          setItems(
            data.previewData.items.map((it, idx) => ({
              id: Date.now() + idx,
              description: it.description || "",
              quantity: Number(it.quantity) || 1,
              rate: Number(it.rate) || 0,
              amount: (Number(it.quantity) || 1) * (Number(it.rate) || 0),
            }))
          );
        }
      }
    } catch (err) {
      setPreviewError(
        err.response?.data?.message || err.message || "Failed to load project invoice preview."
      );
      setPreviewInfo(null);
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  // Initialize or reset form and load projects when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const initModal = async () => {
      setFormError("");
      setActiveTab("GENERATE");
      setIsPreviewMode(false);

      if (!isEditing) {
        setLoadingProjects(true);
        try {
          const res = await getProjects();
          const projs = res?.data || res || [];
          setVendorProjects(Array.isArray(projs) ? projs : []);
        } catch (err) {
          console.error("Failed to load vendor projects:", err);
        } finally {
          setLoadingProjects(false);
        }
      }

      if (existingInvoice) {
        // Pre-fill existing invoice for editing Draft or Rejected
        const pId =
          existingInvoice.projectId?._id ||
          (typeof existingInvoice.projectId === "string" ? existingInvoice.projectId : "");
        setSelectedProjectId(pId);
        setInvoiceId(existingInvoice.invoiceId || "");
        setInvoiceDate(
          existingInvoice.invoiceDate
            ? new Date(existingInvoice.invoiceDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
        setDueDate(
          existingInvoice.dueDate
            ? new Date(existingInvoice.dueDate).toISOString().split("T")[0]
            : ""
        );
        setNotes(existingInvoice.notes || "");

        if (Array.isArray(existingInvoice.items) && existingInvoice.items.length > 0) {
          setItems(
            existingInvoice.items.map((it, idx) => ({
              id: it._id || Date.now() + idx,
              description: it.description || "",
              quantity: Number(it.quantity) || 1,
              rate: Number(it.rate) || 0,
              amount: (Number(it.quantity) || 1) * (Number(it.rate) || 0),
            }))
          );
        } else {
          const amt = Number(existingInvoice.amount || 0);
          setItems([
            {
              id: 1,
              description: existingInvoice.projectTitle || "Field Services",
              quantity: 1,
              rate: amt,
              amount: amt,
            },
          ]);
        }
      } else {
        // New Invoice mode
        const defaultProjId = initialProjectId || "";
        setSelectedProjectId(defaultProjId);
        setInvoiceDate(new Date().toISOString().split("T")[0]);
        setDueDate("");
        setNotes("");
        setItems([{ id: 1, description: "", quantity: 1, rate: 0, amount: 0 }]);

        if (defaultProjId) {
          loadPreview(defaultProjId);
        }
      }
    };

    initModal();
  }, [isOpen, isEditing, existingInvoice, initialProjectId, loadPreview]);

  // Handle project selector change
  const handleSelectProject = (e) => {
    const projId = e.target.value;
    setSelectedProjectId(projId);
    loadPreview(projId);
  };

  // Line item handlers
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === "description") {
        item.description = value;
      } else if (field === "quantity") {
        item.quantity = value === "" ? "" : Number(value);
      } else if (field === "rate") {
        item.rate = value === "" ? "" : Number(value);
      }

      const q = typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 0;
      const r = typeof item.rate === "number" && !isNaN(item.rate) ? item.rate : 0;
      item.amount = Math.round(q * r * 100) / 100;

      updated[index] = item;
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return; // Keep at least one line item
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Live calculations for display
  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  }, [items]);

  const tax = 0; // Fixed at zero per business rule
  const totalAmount = subtotal + tax;

  // Validation
  const validateForm = (isSubmittingAction) => {
    if (!selectedProjectId) {
      return "Please select an approved project.";
    }

    if (!items || items.length === 0) {
      return "At least one line item is required.";
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.description || !it.description.trim()) {
        return `Line item #${i + 1} requires a valid description.`;
      }
      const q = Number(it.quantity);
      if (isNaN(q) || q <= 0) {
        return `Line item #${i + 1} must have a quantity greater than 0.`;
      }
      const r = Number(it.rate);
      if (isNaN(r) || r < 0) {
        return `Line item #${i + 1} cannot have a negative rate.`;
      }
    }

    if (dueDate && invoiceDate) {
      const dDue = new Date(dueDate);
      const dInv = new Date(invoiceDate);
      if (!isNaN(dDue.getTime()) && !isNaN(dInv.getTime()) && dDue < dInv) {
        return "Due date cannot be earlier than invoice date.";
      }
    }

    if (isSubmittingAction) {
      if (!dueDate) {
        return "Due date is required when submitting an invoice for review.";
      }
      if (totalAmount <= 0) {
        return "Total invoice amount must be greater than zero for submission.";
      }
    }

    return null;
  };

  // Open in-memory Invoice Preview before submitting
  const handleOpenPreview = () => {
    setFormError("");
    const validationErr = validateForm(false);
    if (validationErr) {
      setFormError(validationErr);
      return;
    }
    setIsPreviewMode(true);
  };

  // Save Draft or Submit
  const handleSave = async (submitForReview) => {
    setFormError("");
    const validationErr = validateForm(submitForReview);
    if (validationErr) {
      setFormError(validationErr);
      return;
    }

    const payloadItems = items.map((it) => ({
      description: it.description.trim(),
      quantity: Number(it.quantity),
      rate: Number(it.rate),
      amount: Math.round(Number(it.quantity) * Number(it.rate) * 100) / 100,
    }));

    setIsSubmitting(true);
    setSubmittingAction(submitForReview ? "submit" : "draft");

    try {
      if (isEditing) {
        // Editing Draft or Resubmitting Rejected invoice
        await updateInvoice(existingInvoice._id, {
          items: payloadItems,
          invoiceDate: invoiceDate || undefined,
          dueDate: dueDate || undefined,
          notes: notes.trim(),
          submit: submitForReview,
        });
      } else {
        // Creating New invoice
        await createInvoice({
          projectId: selectedProjectId,
          invoiceId: invoiceId.trim() || undefined,
          items: payloadItems,
          invoiceDate: invoiceDate || undefined,
          dueDate: dueDate || undefined,
          notes: notes.trim(),
          status: submitForReview ? "Submitted" : "Draft",
        });
      }

      if (onSuccess) {
        onSuccess(submitForReview ? "submitted" : "saved_draft");
      }
      onClose();
    } catch (err) {
      setFormError(
        err.response?.data?.message || err.message || "Failed to process invoice request."
      );
    } finally {
      setIsSubmitting(false);
      setSubmittingAction(null);
    }
  };

  if (!isOpen) return null;

  // Selected project object for preview reference
  const selectedProjectObj =
    previewInfo?.previewData?.project ||
    existingInvoice?.projectId ||
    vendorProjects.find((p) => (p._id || p.id) === selectedProjectId);

  const isEligible = isEditing ? true : previewInfo ? previewInfo.eligible : true;
  const hasExistingInvoice = isEditing ? false : previewInfo ? previewInfo.hasExistingInvoice : false;
  const disableForm = !isEditing && (!isEligible || hasExistingInvoice);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-3xl max-w-2xl w-full p-6 shadow-2xl my-6 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#F2EBE5] pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center font-bold">
                {isPreviewMode ? <FiEye size={16} /> : <FiFileText size={16} />}
              </div>
              <h2 className="text-lg font-bold text-[#2D3436]">
                {isPreviewMode
                  ? "Invoice Preview"
                  : isRejected
                  ? "Edit & Resubmit Invoice"
                  : isDraft
                  ? "Edit Draft Invoice"
                  : "Raise New Invoice"}
              </h2>
            </div>
            <p className="text-xs text-[#817B77] mt-1 pl-10">
              {isPreviewMode
                ? "Review your itemized invoice before formal submission for Admin review."
                : isRejected
                ? "Address the reviewer's feedback and resubmit for approval."
                : isDraft
                ? "Update your draft line items and submit when ready."
                : "Create an itemized invoice for an approved client project."}
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Form Error Banner */}
          {formError && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <FiAlertCircle size={16} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {isPreviewMode ? (
            /* PREVIEW DOCUMENT */
            <div className="space-y-4">
              {/* Notice Banner */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 text-xs text-[#1E3A8A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiEye size={16} className="text-[#2563EB] shrink-0" />
                  <span>
                    <strong>Unsaved Preview:</strong> Review your invoice details before formal submission. No invoice has been created yet.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(false)}
                  className="text-[#2563EB] hover:underline font-bold text-xs shrink-0 cursor-pointer"
                >
                  Edit Form →
                </button>
              </div>

              {/* Invoice Preview Document Paper */}
              <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-xs space-y-5">
                {/* Header Row: Document Title & Badge */}
                <div className="flex items-start justify-between border-b border-[#F2EBE5] pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#6C5CE7] uppercase tracking-wider block">
                      OFFICIAL INVOICE PREVIEW
                    </span>
                    <h3 className="text-xl font-black text-[#2D3436] tracking-tight">
                      {invoiceId.trim() || `INV-${selectedProjectObj?.projectId || "PRJ"}`}
                    </h3>
                    <p className="text-xs text-[#817B77] mt-0.5">
                      Project: {selectedProjectObj?.projectName || "Field Services"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {isRejected ? "Rejected (Editing)" : isDraft ? "Draft" : "Unsaved Preview"}
                    </span>
                    <p className="text-[11px] text-[#817B77] mt-1">
                      Status: Ready for submission
                    </p>
                  </div>
                </div>

                {/* Two Column Details: Billed To & Dates */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#FAF7F5] rounded-xl p-3 border border-[#E8E2DE]/70 space-y-1">
                    <span className="text-[10px] font-extrabold text-[#817B77] uppercase tracking-wider block">
                      BILLED TO / PROJECT
                    </span>
                    <p className="font-bold text-[#2D3436]">
                      {selectedProjectObj?.client || "Client Representative"}
                    </p>
                    <p className="text-[#6E6763]">
                      {selectedProjectObj?.projectName || "Field Project"} ({selectedProjectObj?.projectId || "PRJ"})
                    </p>
                    {selectedProjectObj?.location && (
                      <p className="text-[#817B77] text-[11px]">
                        📍 {selectedProjectObj.location}
                      </p>
                    )}
                  </div>

                  <div className="bg-[#FAF7F5] rounded-xl p-3 border border-[#E8E2DE]/70 space-y-1">
                    <span className="text-[10px] font-extrabold text-[#817B77] uppercase tracking-wider block">
                      INVOICE TIMELINE
                    </span>
                    <div className="flex justify-between">
                      <span className="text-[#817B77]">Issue Date:</span>
                      <span className="font-bold text-[#2D3436]">{invoiceDate || "Today"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#817B77]">Payment Due:</span>
                      <span className="font-bold text-[#2D3436]">{dueDate || "Upon Receipt"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#817B77]">Payment Terms:</span>
                      <span className="font-medium text-[#6E6763]">Net 30 Days</span>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border border-[#E8E2DE] rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF7F5] text-[#817B77] uppercase text-[10px] font-extrabold border-b border-[#E8E2DE]">
                      <tr>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3 text-center w-16">Qty</th>
                        <th className="py-2.5 px-3 text-right w-24">Rate</th>
                        <th className="py-2.5 px-3 text-right w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2EBE5]">
                      {items.map((it, idx) => (
                        <tr key={it.id || idx} className="hover:bg-[#FAF7F5]/50">
                          <td className="py-2.5 px-3 text-[#2D3436] font-medium">
                            {it.description || "Field Service Item"}
                          </td>
                          <td className="py-2.5 px-3 text-center text-[#6E6763]">
                            {it.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#6E6763]">
                            ${Number(it.rate || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#2D3436]">
                            ${Number(it.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Breakdown */}
                <div className="flex justify-end">
                  <div className="w-64 bg-[#FAF7F5] rounded-xl p-3 border border-[#E8E2DE]/70 space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#6E6763]">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-[#2D3436]">
                        ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#817B77]">
                      <span>Tax (0%):</span>
                      <span>$0.00</span>
                    </div>
                    <div className="pt-2 border-t border-[#E8E2DE] flex justify-between font-extrabold text-sm text-[#2D3436]">
                      <span>Total Due:</span>
                      <span className="text-[#00B894]">
                        ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes / Payment Instructions */}
                {notes ? (
                  <div className="text-xs bg-[#FAF7F5] rounded-xl p-3 border border-[#E8E2DE]/70">
                    <span className="text-[10px] font-extrabold text-[#817B77] uppercase tracking-wider block mb-1">
                      NOTES / PAYMENT INSTRUCTIONS
                    </span>
                    <p className="text-[#3E3734] leading-relaxed whitespace-pre-wrap">
                      {notes}
                    </p>
                  </div>
                ) : null}

                {/* Authorized Digital Representation Disclaimer */}
                <div className="border-t border-[#F2EBE5] pt-3 text-[11px] text-[#817B77] flex items-center justify-between">
                  <span>Authorized Vendor Representation</span>
                  <span className="font-semibold text-[#2D3436]">
                    Digital Verification on Submission
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-2 bg-[#EAE4DF]/60 p-1 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab("GENERATE")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "GENERATE"
                      ? "bg-white text-[#2D3436] shadow-xs"
                      : "text-[#817B77] hover:text-[#2D3436]"
                  }`}
                >
                  <FiFileText size={14} />
                  <span>Generate Digital Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("UPLOAD")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "UPLOAD"
                      ? "bg-white text-[#2D3436] shadow-xs"
                      : "text-[#817B77] hover:text-[#2D3436]"
                  }`}
                >
                  <FiUploadCloud size={14} />
                  <span>Upload Custom Invoice</span>
                  <span className="text-[9px] bg-[#E17055]/10 text-[#E17055] px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                    Preview
                  </span>
                </button>
              </div>

              {/* Rejection Notice Banner (if editing a rejected invoice) */}
              {isRejected && existingInvoice?.rejectionReason && (
                <div className="bg-[#FFEBEE] border border-[#C62828]/20 rounded-2xl p-4 text-xs text-[#C62828] space-y-1 shadow-xs">
                  <div className="font-bold flex items-center gap-1.5">
                    <FiAlertCircle size={15} />
                    <span>Admin Rejection Reason</span>
                  </div>
                  <p className="text-[#3E3734] font-medium pl-5 leading-relaxed">
                    {existingInvoice.rejectionReason}
                  </p>
                </div>
              )}

          {/* TAB 1: GENERATE DIGITAL INVOICE */}
          {activeTab === "GENERATE" && (
            <div className="space-y-4">
              {/* Project Selection / Card */}
              <div className="bg-white rounded-2xl border border-[#E8E2DE] p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D3436] flex items-center gap-1">
                    <span>Target Project</span>
                    <span className="text-[#C62828]">*</span>
                  </label>
                  {loadingPreview && (
                    <span className="text-[11px] text-[#6C5CE7] flex items-center gap-1 font-semibold">
                      <FiLoader className="animate-spin text-xs" />
                      Checking eligibility...
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-3 text-xs">
                    <p className="font-bold text-[#2D3436]">
                      {existingInvoice.projectTitle || existingInvoice.projectId?.projectName || "—"}
                    </p>
                    <p className="text-[#817B77] mt-0.5 text-[11px]">
                      Project Code: {existingInvoice.projectId?.projectId || "—"} • Invoice: {existingInvoice.invoiceId}
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedProjectId}
                      onChange={handleSelectProject}
                      disabled={loadingProjects}
                      className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#2D3436] font-medium outline-none focus:border-[#C8B5AC] appearance-none cursor-pointer pr-10"
                    >
                      <option value="">Select an approved project to invoice...</option>
                      {vendorProjects.map((p) => {
                        const statusLower = (p.status || "").trim().toLowerCase();
                        const isApproved = statusLower === "approved";
                        const isCompleted = statusLower === "completed";
                        return (
                          <option key={p._id || p.id} value={p._id || p.id}>
                            {p.projectName} ({p.projectId || "PRJ"}) — {isApproved ? "Approved ✓" : isCompleted ? "Completed (Paid)" : p.status}
                          </option>
                        );
                      })}
                    </select>
                    <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
                  </div>
                )}

                {/* Preview Error Banner */}
                {previewError && (
                  <div className="bg-[#FFEBEE] border border-[#C62828]/20 rounded-xl p-3 text-xs text-[#C62828] flex items-start gap-2">
                    <FiAlertCircle className="shrink-0 mt-0.5 text-sm" />
                    <div>
                      <p className="font-bold">Preview Error</p>
                      <p className="text-[11px] mt-0.5">{previewError}</p>
                    </div>
                  </div>
                )}

                {/* Eligibility Feedback */}
                {!isEditing && previewInfo && (
                  <div>
                    {!previewInfo.eligible ? (
                      <div className="bg-[#FFF3E0] border border-[#FF9800]/30 rounded-xl p-3 text-xs text-[#E65100] flex items-start gap-2">
                        <FiAlertTriangle className="shrink-0 mt-0.5 text-sm" />
                        <div>
                          <p className="font-bold">Ineligible Project</p>
                          <p className="text-[11px] mt-0.5">
                            {previewInfo.eligibilityReason || "Only Admin-approved projects can be invoiced."}
                          </p>
                        </div>
                      </div>
                    ) : previewInfo.hasExistingInvoice ? (
                      <div className="bg-[#E3F2FD] border border-[#1565C0]/30 rounded-xl p-3 text-xs text-[#1565C0] flex items-start gap-2">
                        <FiInfo className="shrink-0 mt-0.5 text-sm" />
                        <div>
                          <p className="font-bold">Invoice Already Generated</p>
                          <p className="text-[11px] mt-0.5">
                            An invoice ({previewInfo.existingInvoice?.invoiceId}) has already been raised for this project (Status: {previewInfo.existingInvoice?.status}).
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#E8F5E9] border border-[#2E7D32]/20 rounded-xl p-2.5 text-xs text-[#2E7D32] flex items-center gap-2">
                        <FiCheck className="shrink-0 text-sm" />
                        <span className="font-semibold">
                          Project is approved and eligible for invoicing.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Project Details Snapshot */}
                {selectedProjectObj && isEligible && !hasExistingInvoice && (
                  <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-3 text-xs grid grid-cols-2 gap-2 text-[#817B77]">
                    <div>
                      <span className="font-semibold">Client:</span>{" "}
                      <span className="text-[#2D3436] font-medium">
                        {selectedProjectObj.client || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Location:</span>{" "}
                      <span className="text-[#2D3436] font-medium">
                        {selectedProjectObj.location || "—"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Invoice Dates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-[#E8E2DE] p-4 shadow-xs">
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">
                    Invoice Date
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      disabled={disableForm}
                      className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D3436] outline-none focus:border-[#C8B5AC] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E8E2DE] p-4 shadow-xs">
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">
                    Due Date <span className="text-[#C62828]">*</span>
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={disableForm}
                      required
                      className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D3436] outline-none focus:border-[#C8B5AC] disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Line Items Table */}
              <div className="bg-white rounded-2xl border border-[#E8E2DE] p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#2D3436] uppercase tracking-wider text-[11px]">
                    Itemized Line Items
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={disableForm}
                    className="flex items-center gap-1 text-xs font-bold text-[#6C5CE7] hover:text-[#5B4BC4] disabled:opacity-50 cursor-pointer"
                  >
                    <FiPlus size={14} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-3 grid grid-cols-12 gap-2.5 items-center text-xs"
                    >
                      {/* Description */}
                      <div className="col-span-12 sm:col-span-5">
                        <label className="block text-[10px] font-bold text-[#817B77] mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(index, "description", e.target.value)
                          }
                          disabled={disableForm}
                          placeholder="e.g., Drone Mapping & Site Inspection"
                          className="w-full bg-white border border-[#E8E2DE] rounded-lg px-2.5 py-1.5 text-xs text-[#2D3436] outline-none focus:border-[#C8B5AC] disabled:opacity-50"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-[#817B77] mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          disabled={disableForm}
                          className="w-full bg-white border border-[#E8E2DE] rounded-lg px-2 py-1.5 text-xs text-[#2D3436] outline-none focus:border-[#C8B5AC] disabled:opacity-50 text-right"
                        />
                      </div>

                      {/* Rate */}
                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-[#817B77] mb-1">
                          Rate ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(index, "rate", e.target.value)
                          }
                          disabled={disableForm}
                          className="w-full bg-white border border-[#E8E2DE] rounded-lg px-2 py-1.5 text-xs text-[#2D3436] outline-none focus:border-[#C8B5AC] disabled:opacity-50 text-right"
                        />
                      </div>

                      {/* Amount Display */}
                      <div className="col-span-3 sm:col-span-2 text-right">
                        <label className="block text-[10px] font-bold text-[#817B77] mb-1">
                          Amount
                        </label>
                        <div className="py-1.5 font-bold text-[#2D3436]">
                          ${Number(item.amount || 0).toFixed(2)}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-1 sm:col-span-1 text-right flex justify-end pt-4 sm:pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length <= 1 || disableForm}
                          className="text-[#817B77] hover:text-[#C62828] disabled:opacity-30 disabled:hover:text-[#817B77] p-1 rounded transition-colors"
                          title="Remove item"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-3.5 space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs text-[#817B77]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#2D3436]">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#817B77]">
                    <span>Tax (Fixed 0%)</span>
                    <span className="font-semibold text-[#2D3436]">$0.00</span>
                  </div>
                  <div className="pt-2 border-t border-[#E8E2DE] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D3436]">
                      Total Amount
                    </span>
                    <span className="text-base font-black text-[#2E7D32]">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes Field */}
              <div className="bg-white rounded-2xl border border-[#E8E2DE] p-4 shadow-xs">
                <label className="block text-xs font-bold text-[#2D3436] mb-1">
                  Notes / Payment Instructions
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={disableForm}
                  placeholder="Optional bank transfer details, deliverables references, or notes..."
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3 text-xs text-[#2D3436] outline-none focus:border-[#C8B5AC] disabled:opacity-50 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD CUSTOM INVOICE (UI-ONLY OPTION) */}
          {activeTab === "UPLOAD" && (
            <div className="space-y-4">
              {/* Notice Banner */}
              <div className="bg-[#FFF3E0] border border-[#FF9800]/30 rounded-2xl p-4 text-xs text-[#E65100] space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <FiAlertTriangle size={16} className="text-[#F57C00] shrink-0" />
                  <span>Document Upload Notice</span>
                </div>
                <p className="leading-relaxed pl-6">
                  Custom document upload and automated parsing is currently in scheduled development. To ensure immediate review and avoid payment processing delays, please generate your invoice using the <strong>Generate Digital Invoice</strong> tab.
                </p>
              </div>

              {/* Mock Upload Zone */}
              <div className="bg-white border-2 border-dashed border-[#E8E2DE] rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF7F5] text-[#817B77] flex items-center justify-center mx-auto">
                  <FiUploadCloud size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D3436]">
                    Upload custom PDF invoice document
                  </h4>
                  <p className="text-xs text-[#817B77] mt-1 max-w-sm mx-auto">
                    Supported formats: PDF, PNG, JPG up to 10MB (preview mode only).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("GENERATE")}
                  className="bg-[#6C5CE7] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#5B4BC4] transition-colors cursor-pointer"
                >
                  Switch to Digital Invoice Generator
                </button>
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {isPreviewMode ? (
          <div className="pt-4 border-t border-[#F2EBE5] flex items-center justify-between w-full shrink-0">
            <button
              type="button"
              onClick={() => setIsPreviewMode(false)}
              disabled={isSubmitting}
              className="bg-white border border-[#E8E2DE] text-[#2D3436] hover:bg-[#F2EBE5] font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FiArrowLeft size={14} />
              <span>Back to Edit</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSubmitting}
                className="bg-[#EAE4DF] hover:bg-[#DDD5CF] text-[#3E3734] font-bold text-xs px-4 py-2 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting && submittingAction === "draft"
                  ? "Saving Draft..."
                  : "Save Draft"}
              </button>

              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSubmitting}
                className="bg-[#00B894] hover:bg-[#00A383] text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && submittingAction === "submit" ? (
                  <FiLoader size={14} className="animate-spin" />
                ) : (
                  <FiCheck size={14} />
                )}
                <span>
                  {isSubmitting && submittingAction === "submit"
                    ? "Submitting..."
                    : isRejected
                    ? "Resubmit Invoice"
                    : "Submit for Review"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-[#F2EBE5] flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-white border border-[#E8E2DE] text-[#6E6763] hover:text-[#2D3436] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#F2EBE5] transition-colors"
            >
              Cancel
            </button>

            {activeTab === "GENERATE" && (
              <>
                {/* Save Draft Button */}
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={isSubmitting || disableForm}
                  className="bg-[#EAE4DF] hover:bg-[#DDD5CF] text-[#3E3734] font-bold text-xs px-4 py-2 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && submittingAction === "draft"
                    ? "Saving Draft..."
                    : "Save Draft"}
                </button>

                {/* Preview Invoice Button */}
                <button
                  type="button"
                  onClick={handleOpenPreview}
                  disabled={isSubmitting || disableForm}
                  className="bg-white border-2 border-[#6C5CE7] hover:bg-[#6C5CE7]/10 text-[#6C5CE7] font-bold text-xs px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <FiEye size={14} />
                  <span>Preview Invoice</span>
                </button>

                {/* Submit for Review Button */}
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={isSubmitting || disableForm}
                  className="bg-[#00B894] hover:bg-[#00A383] text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <FiCheck size={14} />
                  <span>
                    {isSubmitting && submittingAction === "submit"
                      ? "Submitting..."
                      : isRejected
                      ? "Resubmit Invoice"
                      : "Submit for Review"}
                  </span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RaiseInvoiceModal;
