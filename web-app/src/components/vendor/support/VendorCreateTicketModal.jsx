import React, { useState, useEffect } from "react";
import { FiX, FiAlertCircle, FiPlus, FiLoader } from "react-icons/fi";
import { createSupportTicket } from "../../../services/supportService";
import { getProjects } from "../../../services/projectService";

const VendorCreateTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSubject("");
      setDescription("");
      setPriority("Medium");
      setProjectId("");
      setError(null);

      // Fetch projects for selection
      const fetchProjects = async () => {
        setProjectsLoading(true);
        try {
          const res = await getProjects();
          const projectList = res.data || res || [];
          setProjects(Array.isArray(projectList) ? projectList : []);
        } catch (err) {
          console.error("Failed to load projects for ticket creation:", err);
          setProjects([]);
        } finally {
          setProjectsLoading(false);
        }
      };

      fetchProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        subject: subject.trim(),
        description: description.trim(),
        priority,
      };

      if (projectId) {
        payload.projectId = projectId;
      }

      await createSupportTicket(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create support ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E8E2DE] shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2DE] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FBE9E7] text-[#D84315] flex items-center justify-center font-bold">
              <FiPlus size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#3E3734]">
                Raise Support Ticket
              </h3>
              <p className="text-xs text-[#817B77] font-medium">
                Submit an inquiry or issue to operations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#817B77] hover:text-[#3E3734] p-1.5 rounded-xl hover:bg-[#FAF7F5] transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <FiAlertCircle className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Input */}
          <div>
            <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
              Subject <span className="text-[#C62828]">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Unable to upload field inspection report"
              required
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Related Project Selection */}
          <div>
            <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
              Related Project <span className="text-[#817B77] font-normal">(Optional)</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={projectsLoading}
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC] focus:bg-white transition-all font-medium cursor-pointer"
            >
              <option value="">General Inquiry (No specific project)</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName || p.projectId} ({p.projectId || "Project"})
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC] focus:bg-white transition-all font-medium cursor-pointer"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
              Description <span className="text-[#817B77] font-normal">(Optional)</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide relevant details about your support request..."
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] focus:bg-white transition-all font-medium resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E2DE] mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl text-xs font-bold text-[#817B77] hover:bg-[#EAE4DF] hover:text-[#3E3734] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !subject.trim()}
              className="px-5 py-2 bg-[#8D6E63] hover:bg-[#795548] text-white rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin text-sm" />
                  <span>Creating Ticket...</span>
                </>
              ) : (
                <span>Submit Ticket</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorCreateTicketModal;
