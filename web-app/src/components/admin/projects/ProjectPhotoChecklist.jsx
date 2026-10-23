import { useRef } from "react";
import { FiPlus, FiCamera, FiCheckCircle, FiX } from "react-icons/fi";

const ProjectPhotoChecklist = ({
  checklistItems,
  setChecklistItems,
  photos,
  setPhotos,
  photoError,
  setPhotoError,
}) => {
  const fileInputRef = useRef(null);

  const completedCount = checklistItems.filter((item) => item.checked).length;

  const handleToggleCheck = (id) => {
    setChecklistItems(
      checklistItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleFileChange = (e) => {
    setPhotoError("");
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const validFiles = [];
    const validExtensions = ["jpg", "jpeg", "png", "heic"];

    for (const file of selectedFiles) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!validExtensions.includes(ext)) {
        setPhotoError(`Invalid format in "${file.name}". Only JPG, PNG, and HEIC are supported.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError(`"${file.name}" exceeds the 5MB limit.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      validFiles.push(file);
    }

    setPhotos([...photos, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = (indexToRemove) => {
    const fileToRemove = photos[indexToRemove];
    if (fileToRemove && fileToRemove.preview) {
      try {
        URL.revokeObjectURL(fileToRemove.preview);
      } catch {
        // ignore
      }
    }
    setPhotos(photos.filter((_, idx) => idx !== indexToRemove));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPhotoError("");
  };

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
      {/* Header & Dynamic Counter */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#3E3734]">Photo Checklist</h2>
        <div className="flex items-center gap-2">
          {photos.length > 0 && (
            <span className="text-[11px] font-semibold text-[#8A817C] bg-[#FAF7F5] border border-[#E8E2DE] px-2 py-0.5 rounded-md">
              {photos.length} {photos.length === 1 ? "photo" : "photos"} selected
            </span>
          )}
          <span className="text-xs font-semibold text-[#817B77]">
            {completedCount} of {checklistItems.length} completed
          </span>
        </div>
      </div>

      {/* Checklist Grid/List */}
      <div className="space-y-3.5 pt-1">
        {checklistItems.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-[#3E3734] hover:text-[#000] transition-colors"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => handleToggleCheck(item.id)}
              className="w-4 h-4 rounded border-[#E8E2DE] text-[#8A817C] focus:ring-0 cursor-pointer accent-[#8A817C]"
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      {/* Upload Photos Box */}
      <div className="pt-2">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".jpg,.jpeg,.png,.heic"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-[#FAF7F5] hover:bg-[#F2EBE5] border border-[#E8E2DE] rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#4A423F] transition-colors shadow-xs"
        >
          <FiPlus className="text-sm text-[#817B77]" />
          <span>Upload Photos</span>
        </button>

        <p className="text-[11px] text-[#817B77] text-center mt-2">
          Supported formats: JPG, PNG, HEIC (Max 5MB per photo)
        </p>

        {photoError && (
          <p className="text-[11px] font-semibold text-[#C62828] text-center mt-1">
            {photoError}
          </p>
        )}

        {/* Selected Photos Preview List */}
        {photos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-[#F2EBE5]">
            {photos.map((file, idx) => (
              <span
                key={`${file.name}-${idx}`}
                className="inline-flex items-center gap-1.5 bg-[#FAF7F5] border border-[#E8E2DE] px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#3E3734] transition-all hover:border-[#D6CEC7]"
              >
                <FiCamera className="text-xs text-[#817B77] shrink-0" />
                <span className="truncate max-w-[140px]" title={file.name}>
                  {file.name}
                </span>
                <FiCheckCircle className="text-xs text-[#2E7D32] shrink-0" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(idx);
                  }}
                  aria-label={`Remove photo ${file.name}`}
                  title={`Remove ${file.name}`}
                  className="p-0.5 text-[#817B77] hover:text-[#C62828] hover:bg-[#F2EBE5] rounded transition-colors cursor-pointer ml-0.5 focus:outline-none shrink-0"
                >
                  <FiX className="text-xs" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPhotoChecklist;
