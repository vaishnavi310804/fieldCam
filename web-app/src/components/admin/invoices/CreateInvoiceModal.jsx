import { useState, useEffect } from "react";
import { getProjects } from "../../../services/projectService";
import { getVendors } from "../../../services/vendorService";
import { FiX, FiSave, FiAlertCircle, FiChevronDown } from "react-icons/fi";

const CreateInvoiceModal = ({ isOpen, onClose, onCreateInvoice }) => {
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Payload form state
  const [invoiceId, setInvoiceId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [amount, setAmount] = useState("");
  const [tax, setTax] = useState("0");
  const [status, setStatus] = useState("Pending");

  // UI-only form state
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      // Reset form state when modal opens
      setInvoiceId(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
      setProjectId("");
      setVendorId("");
      setAmount("");
      setTax("0");
      setStatus("Pending");
      setDueDate("");
      setNotes("");
      setError("");

      setLoadingData(true);
      try {
        const [projRes, vendRes] = await Promise.all([
          getProjects(),
          getVendors(),
        ]);
        setProjects(projRes.data || []);
        setVendors(vendRes.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load projects and vendors"
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isOpen]);

  if (!isOpen) return null;

  // Selected project object for deriving Project Code and auto-populating Vendor
  const selectedProject = projects.find((p) => p._id === projectId);
  const projectCodeDisplay = selectedProject
    ? selectedProject.projectId || selectedProject.code || "PRJ-2845"
    : "";

  const handleProjectChange = (e) => {
    const selectedProjId = e.target.value;
    setProjectId(selectedProjId);

    const projObj = projects.find((p) => p._id === selectedProjId);
    if (projObj && projObj.vendorId) {
      const vId =
        typeof projObj.vendorId === "object"
          ? projObj.vendorId._id
          : projObj.vendorId;
      setVendorId(vId || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!invoiceId.trim()) {
      setError("Please enter an Invoice ID.");
      return;
    }
    if (!projectId) {
      setError("Please select a Project.");
      return;
    }
    if (!vendorId) {
      setError("Please select a Vendor.");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) < 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const payload = {
      invoiceId: invoiceId.trim(),
      projectId,
      vendorId,
      amount: Number(amount),
      tax: Number(tax || 0),
      status,
    };

    try {
      setIsSubmitting(true);
      await onCreateInvoice(payload);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create invoice"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations for Summary Box
  const subtotalNum = Number(amount || 0);
  const taxNum = Number(tax || 0);
  const totalNum = subtotalNum + taxNum;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#EEE9E6] border border-[#E8E2DE] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#3E3734]">New Invoice</h2>
            <p className="text-xs text-[#817B77] mt-0.5">
              Create a new vendor invoice for payment processing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#817B77] hover:text-[#3E3734] p-1.5 rounded-xl hover:bg-[#EAE4DF] transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <FiAlertCircle className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content Card */}
        <form onSubmit={handleSubmit} className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <h3 className="text-sm font-bold text-[#3E3734] mb-2">
            Invoice Details
          </h3>

          {loadingData ? (
            <div className="py-8 text-center text-xs text-[#817B77]">
              Loading project & vendor data...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Row 1: Vendor Name & Project Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vendor Name */}
                <div>
                  <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                    Vendor Name <span className="text-[#C62828]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors appearance-none cursor-pointer pr-10"
                    >
                      <option value="">e.g., Apex Field Co.</option>
                      {vendors.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.companyName} ({v.contactName || "Vendor"})
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
                  </div>
                </div>

                {/* Project Code */}
                <div>
                  <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                    Project Code <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={projectCodeDisplay || invoiceId}
                    placeholder="e.g., PRJ-2845"
                    className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium placeholder-[#A39A94] outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Project Name (Full Width) */}
              <div>
                <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                  Project Name <span className="text-[#C62828]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={projectId}
                    onChange={handleProjectChange}
                    className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors appearance-none cursor-pointer pr-10"
                  >
                    <option value="">e.g., Downtown Plaza Inspection</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.projectName} ({p.projectId || "Project"})
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
                </div>
              </div>

              {/* Row 3: Invoice Amount & Tax Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Invoice Amount */}
                <div>
                  <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                    Invoice Amount <span className="text-[#C62828]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#817B77]">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-[#3E3734] font-semibold outline-none focus:border-[#C8B5AC] transition-colors"
                    />
                  </div>
                </div>

                {/* Tax Amount */}
                <div>
                  <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                    Tax Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#817B77]">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-[#3E3734] font-semibold outline-none focus:border-[#C8B5AC] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Status & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                    Status <span className="text-[#C62828]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors appearance-none cursor-pointer pr-10"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Paid">Paid</option>
                    </select>
                    <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
                  </div>
                </div>

                {/* Due Date (UI Only) */}
                <div>
                  <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors cursor-pointer"
                  />
                </div>
              </div>

              {/* Row 5: Notes (UI Only) */}
              <div>
                <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes or comments..."
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors leading-relaxed"
                />
              </div>

              {/* Summary Section */}
              <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-4 space-y-2.5 mt-2">
                <div className="flex items-center justify-between text-xs text-[#817B77]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#3E3734]">
                    ${subtotalNum.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#817B77]">
                  <span>Tax</span>
                  <span className="font-semibold text-[#3E3734]">
                    ${taxNum.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E8E2DE] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3E3734]">
                    Total Amount
                  </span>
                  <span className="text-base font-bold text-[#3E3734]">
                    ${totalNum.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-white hover:bg-[#F2EBE5] text-[#6E6763] hover:text-[#3E3734] border border-[#E8E2DE] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FiX className="text-xs" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || loadingData}
              className="bg-[#8A817C] hover:bg-[#6E6763] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              <FiSave className="text-xs" />
              <span>{isSubmitting ? "Saving..." : "Save Invoice"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
