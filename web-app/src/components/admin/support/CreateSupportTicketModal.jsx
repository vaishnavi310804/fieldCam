import { useState, useEffect } from "react";
import { getVendors } from "../../../services/vendorService";
import { getProjects } from "../../../services/projectService";
import { FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const ALLOWED_PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const CreateSupportTicketModal = ({ isOpen, onClose, onCreateTicket }) => {
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [ticketId, setTicketId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setTicketId(`TKT-${Math.floor(400 + Math.random() * 900)}`);
    setVendorId("");
    setProjectId("");
    setSubject("");
    setDescription("");
    setPriority("Medium");
    setError("");

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [vendRes, projRes] = await Promise.all([
          getVendors(),
          getProjects(),
        ]);
        setVendors(vendRes.data || []);
        setProjects(projRes.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load vendors and projects"
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!ticketId.trim()) {
      setError("Please enter a Ticket ID.");
      return;
    }
    if (!vendorId) {
      setError("Please select a Vendor.");
      return;
    }
    if (!subject.trim()) {
      setError("Please enter a Subject.");
      return;
    }

    const payload = {
      ticketId: ticketId.trim(),
      vendorId,
      subject: subject.trim(),
      priority,
    };

    if (projectId) {
      payload.projectId = projectId;
    }

    if (description.trim()) {
      payload.description = description.trim();
    }

    try {
      setIsSubmitting(true);
      await onCreateTicket(payload);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create support ticket"
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
            Create New Support Ticket
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
            Loading real vendor & project data...
          </div>
        ) : (
          <div className="space-y-3.5 text-xs">
            {/* Ticket ID */}
            <div>
              <label className="block font-bold text-[#3E3734] mb-1">
                Ticket ID <span className="text-[#C62828]">*</span>
              </label>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="e.g., TKT-405"
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2 text-[#3E3734] outline-none focus:border-[#C8B5AC]"
              />
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

            {/* Project Selection (Optional) */}
            <div>
              <label className="block font-bold text-[#3E3734] mb-1">
                Select Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2 text-[#3E3734] outline-none focus:border-[#C8B5AC] cursor-pointer"
              >
                <option value="">None / General issue</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.projectId} — {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block font-bold text-[#3E3734] mb-1">
                Subject <span className="text-[#C62828]">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of issue or request"
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2 text-[#3E3734] outline-none focus:border-[#C8B5AC]"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block font-bold text-[#3E3734] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2 text-[#3E3734] outline-none focus:border-[#C8B5AC] cursor-pointer"
              >
                {ALLOWED_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-[#3E3734] mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed description of the issue..."
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3 text-[#3E3734] outline-none focus:border-[#C8B5AC]"
              />
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
            <span>{isSubmitting ? "Creating..." : "Create Ticket"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSupportTicketModal;
