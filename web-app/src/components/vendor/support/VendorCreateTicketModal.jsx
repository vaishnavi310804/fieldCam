import React, { useState, useEffect } from "react";
import {
  FiX,
  FiAlertCircle,
  FiFileText,
  FiTag,
  FiSettings,
  FiDollarSign,
  FiUser,
  FiZap,
  FiHelpCircle,
  FiInfo,
  FiLoader,
  FiBriefcase,
  FiCheck,
} from "react-icons/fi";
import { createSupportTicket } from "../../../services/supportService";
import { getProjects } from "../../../services/projectService";

const CATEGORY_OPTIONS = [
  {
    id: "Technical Issue",
    title: "Technical Issue",
    description: "Report bugs or technical problems",
    icon: FiSettings,
  },
  {
    id: "Billing",
    title: "Billing",
    description: "Questions about payments and invoices",
    icon: FiDollarSign,
  },
  {
    id: "Account",
    title: "Account",
    description: "Account settings and credentials",
    icon: FiUser,
  },
  {
    id: "Feature Request",
    title: "Feature Request",
    description: "Suggest new features or improvements",
    icon: FiZap,
  },
  {
    id: "General",
    title: "General",
    description: "General questions and inquiries",
    icon: FiHelpCircle,
  },
];

const PRIORITY_OPTIONS = [
  {
    id: "High",
    title: "High",
    subtitle: "Urgent - Needs immediate attention",
  },
  {
    id: "Medium",
    title: "Medium",
    subtitle: "Normal - Standard priority",
  },
  {
    id: "Low",
    title: "Low",
    subtitle: "Can wait - Not urgent",
  },
];

const VendorCreateTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Technical Issue");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSubject("");
      setCategory("Technical Issue");
      setPriority("Medium");
      setDescription("");
      setProjectId("");
      setError(null);

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

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        subject: subject.trim(),
        category,
        priority,
        description: description.trim(),
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E8E2DE] shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2DE] bg-gradient-to-r from-[#FAF7F5] to-[#F4F0ED] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#E8E2DE] text-[#3E3734] flex items-center justify-center font-bold shadow-2xs">
              <FiHelpCircle size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#3E3734] tracking-tight">
                Create New Support Ticket
              </h2>
              <p className="text-xs text-[#817B77] font-medium">
                We'll get back to you within 2-4 hours
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#817B77] hover:text-[#3E3734] p-2 rounded-xl hover:bg-[#EAE4DF] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Error Alert */}
          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
              <FiAlertCircle className="text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="vendor-create-ticket-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Subject Input */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#3E3734] mb-1.5">
                <FiFileText className="text-[#817B77]" />
                <span>Subject</span>
                <span className="text-[#C62828]">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Category Selection Cards */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#3E3734] mb-2">
                <FiTag className="text-[#817B77]" />
                <span>Category</span>
                <span className="text-[#C62828]">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CATEGORY_OPTIONS.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                        isSelected
                          ? "border-[#3E3734] bg-[#FAF7F5] shadow-2xs"
                          : "border-[#E8E2DE] bg-white hover:border-[#C8B5AC] hover:bg-[#FAF7F5]/50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5 ${
                          isSelected ? "bg-[#3E3734] text-white" : "bg-[#FAF7F5] text-[#817B77]"
                        }`}
                      >
                        <Icon />
                      </div>
                      <div className="min-w-0 flex-1 pr-4">
                        <h4 className="text-xs font-bold text-[#3E3734] leading-tight mb-0.5">
                          {cat.title}
                        </h4>
                        <p className="text-[11px] text-[#817B77] leading-tight font-medium">
                          {cat.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#3E3734] text-white flex items-center justify-center text-[10px]">
                          <FiCheck />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Selection Cards */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#3E3734] mb-2">
                <FiAlertCircle className="text-[#817B77]" />
                <span>Priority</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PRIORITY_OPTIONS.map((p) => {
                  const isSelected = priority === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setPriority(p.id)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-center ${
                        isSelected
                          ? "bg-[#E3F2FD] border-[#90CAF9] text-[#1565C0] shadow-2xs"
                          : "bg-white border-[#E8E2DE] text-[#3E3734] hover:border-[#C8B5AC] hover:bg-[#FAF7F5]/50"
                      }`}
                    >
                      <span className="text-xs font-bold block mb-0.5">{p.title}</span>
                      <span
                        className={`text-[10px] font-medium leading-tight block ${
                          isSelected ? "text-[#1976D2]" : "text-[#817B77]"
                        }`}
                      >
                        {p.subtitle}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Project Selector */}
            {projects.length > 0 && (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#3E3734] mb-1.5">
                  <FiBriefcase className="text-[#817B77]" />
                  <span>Related Project</span>
                  <span className="text-[#817B77] font-normal">(Optional)</span>
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
            )}

            {/* Description Textarea */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#3E3734] mb-1.5">
                <FiFileText className="text-[#817B77]" />
                <span>Description</span>
                <span className="text-[#C62828]">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed information about your issue..."
                required
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] focus:bg-white transition-all font-medium resize-none"
              />
              <p className="text-[11px] text-[#817B77] mt-1 font-medium">
                Please include as many details as possible to help us resolve your issue quickly
              </p>
            </div>

            {/* What Happens Next Info Panel */}
            <div className="bg-[#E3F2FD]/50 border border-[#BBDEFB] rounded-2xl p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#1565C0] font-bold">
                <FiInfo className="text-sm shrink-0" />
                <span>What happens next?</span>
              </div>
              <ul className="text-[11px] text-[#1E88E5] font-medium space-y-1 pl-6 list-disc">
                <li>You'll receive a confirmation with your ticket number</li>
                <li>Our support team will review your ticket within 2-4 hours</li>
                <li>You can track the status of your ticket in the table below</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#E8E2DE] bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-1/2 py-2.5 bg-white border border-[#E8E2DE] rounded-2xl text-xs font-bold text-[#3E3734] hover:bg-[#FAF7F5] transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="vendor-create-ticket-form"
            disabled={loading || !subject.trim() || !description.trim()}
            className="w-1/2 py-2.5 bg-[#D7CCC8] hover:bg-[#C8B5AC] text-[#3E3734] rounded-2xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin text-sm" />
                <span>Creating Ticket...</span>
              </>
            ) : (
              <span>Create Ticket</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorCreateTicketModal;
