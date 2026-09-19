import { useState, useEffect } from "react";
import { getProjects } from "../../../services/projectService";
import { getVendors } from "../../../services/vendorService";
import { FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const CreateInvoiceModal = ({ isOpen, onClose, onCreateInvoice }) => {
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [invoiceId, setInvoiceId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [amount, setAmount] = useState("");
  const [tax, setTax] = useState("0");
  const [status, setStatus] = useState("Pending");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Generate random invoice ID suggestion
    setInvoiceId(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
    setProjectId("");
    setVendorId("");
    setAmount("");
    setTax("0");
    setStatus("Pending");
    setError("");

    const fetchData = async () => {
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

  const handleProjectChange = (e) => {
    const selectedProjId = e.target.value;
    setProjectId(selectedProjId);

    const projObj = projects.find((p) => p._id === selectedProjId);
    if (projObj && projObj.vendorId) {
      const vId = typeof projObj.vendorId === "object" ? projObj.vendorId._id : projObj.vendorId;
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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E8E2DE] space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
          <h3 className="text-sm font-bold text-[#3E3734]">
            Create New Invoice
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {error && (
          <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <FiAlertCircle className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loadingData ? (
          <div className="py-8 text-center text-xs text-[#817B77]">
            Loading real project & vendor data...
          </div>
        ) : (
          <div className="space-y-3.5 text-xs">
            {/* Invoice ID */}
            <div>
              <label className="block font-bold text-[#3E3734] mb-1">
                Invoice ID <span className="text-[#C62828]">*</span>
              </label>
              <input
                type="text"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                placeholder="e.g., INV-1045"
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2 text-[#3E3734] outline-none focus:border-[#C8B5AC]"
              />
            </div>

            {/* Project Selection */}
            <div>
              <label className="block font-bold text-[#3E3734] mb-1">
                Select Project <span className="text-[#C62828]">*</span>
              </label>
              <select
                value={projectId}
                onChange={handleProjectChange}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2 text-[#3E3734] outline-none focus:border-[#C8B5AC] cursor-pointer"
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.projectId} — {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor Selection */}
            <div>
              <label className="block font-bold text-[#3E3734] mb-1">
                Select Vendor <span className="text-[#C62828]">*</span>
              </label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2 text-[#3E3734] outline-none focus:border-[#C8B5AC] cursor-pointer"
              >
                <option value="">Select vendor...</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.companyName} ({v.contactName || "Vendor"})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount & Tax */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#3E3734] mb-1">
                  Amount ($) <span className="text-[#C62828]">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2 text-[#3E3734] outline-none focus:border-[#C8B5AC]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#3E3734] mb-1">
                  Tax ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2 text-[#3E3734] outline-none focus:border-[#C8B5AC]"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block font-bold text-[#3E3734] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2 text-[#3E3734] outline-none focus:border-[#C8B5AC] cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-[#F2EBE5] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-white border border-[#E8E2DE] text-[#6E6763] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#F2EBE5]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loadingData}
            className="bg-[#8A817C] text-white font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#6E6763] transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <FiCheckCircle className="text-xs" />
            <span>{isSubmitting ? "Creating..." : "Create Invoice"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoiceModal;
