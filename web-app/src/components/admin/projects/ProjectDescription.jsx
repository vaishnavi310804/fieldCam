import { useRef } from "react";
import { FiPaperclip, FiFileText, FiCheckCircle } from "react-icons/fi";

const ProjectDescription = ({
  description,
  setDescription,
  attachments,
  setAttachments,
  attachmentError,
  setAttachmentError,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setAttachmentError("");
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const validFiles = [];
    const validExtensions = ["pdf", "docx", "xlsx"];

    for (const file of selectedFiles) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!validExtensions.includes(ext)) {
        setAttachmentError(`Invalid format in "${file.name}". Only PDF, DOCX, and XLSX are supported.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setAttachmentError(`"${file.name}" exceeds the 10MB limit.`);
        return;
      }
      validFiles.push(file);
    }

    setAttachments([...attachments, ...validFiles]);
  };

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
      <h2 className="text-sm font-bold text-[#3E3734]">Project Description</h2>

      {/* Description & Notes Field */}
      <div>
        <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
          Description & Notes
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide detailed project requirements, milestones, and specific operational instructions..."
          className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors leading-relaxed"
        />
      </div>

      {/* Add Attachments Box */}
      <div className="pt-2">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".pdf,.docx,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-[#FAF7F5] hover:bg-[#F2EBE5] border border-[#E8E2DE] rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#4A423F] transition-colors shadow-xs"
        >
          <FiPaperclip className="text-sm text-[#817B77]" />
          <span>Add Attachments</span>
        </button>

        <p className="text-[11px] text-[#817B77] text-center mt-2">
          Supported formats: PDF, DOCX, XLSX (Max 10MB)
        </p>

        {attachmentError && (
          <p className="text-[11px] font-semibold text-[#C62828] text-center mt-1">
            {attachmentError}
          </p>
        )}

        {/* Selected Attachments List */}
        {attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-[#F2EBE5]">
            {attachments.map((file, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 bg-[#FAF7F5] border border-[#E8E2DE] px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#3E3734]"
              >
                <FiFileText className="text-xs text-[#817B77]" />
                <span className="truncate max-w-[140px]">{file.name}</span>
                <FiCheckCircle className="text-xs text-[#2E7D32]" />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDescription;
