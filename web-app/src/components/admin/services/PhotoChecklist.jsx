import { useState } from "react";
import { FiCamera, FiPlus, FiGrid, FiTrash2, FiCheck } from "react-icons/fi";

const REQUIREMENT_TYPES = ["REQUIRED", "OPTIONAL"];
const PHOTO_TYPES = ["WIDE ANGLE", "CLOSE UP", "HIGH DETAIL", "GENERAL"];

const PhotoChecklist = ({ checklistItems, setChecklistItems, readOnly = false }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newReqType, setNewReqType] = useState("REQUIRED");
  const [newPhotoType, setNewPhotoType] = useState("GENERAL");

  const handleAddRequirement = () => {
    if (!newTitle.trim()) return;
    const newItem = {
      title: newTitle.trim(),
      requirementType: newReqType,
      photoType: newPhotoType,
    };
    setChecklistItems([...checklistItems, newItem]);
    setNewTitle("");
    setNewReqType("REQUIRED");
    setNewPhotoType("GENERAL");
    setShowAddForm(false);
  };

  const handleDeleteItem = (indexToDelete) => {
    if (readOnly) return;
    setChecklistItems(checklistItems.filter((_, idx) => idx !== indexToDelete));
  };

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#F2EBE5] text-[#6E6763] flex items-center justify-center shrink-0">
            <FiCamera className="text-sm" />
          </div>
          <h2 className="text-sm font-bold text-[#3E3734]">Photo Checklist</h2>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-semibold text-[#817B77] hover:text-[#3E3734] hover:bg-[#F2EBE5] px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
          >
            <FiPlus className="text-xs" />
            <span>Add Requirement</span>
          </button>
        )}
      </div>

      {/* Add New Form inline if toggled */}
      {showAddForm && !readOnly && (
        <div className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3.5 space-y-3">
          <input
            type="text"
            placeholder="Requirement title (e.g., Before Service Overview)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-white border border-[#E8E2DE] rounded-xl px-3 py-2 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC]"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newReqType}
              onChange={(e) => setNewReqType(e.target.value)}
              className="bg-white border border-[#E8E2DE] rounded-xl px-2.5 py-1.5 text-xs text-[#3E3734] outline-none"
            >
              {REQUIREMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={newPhotoType}
              onChange={(e) => setNewPhotoType(e.target.value)}
              className="bg-white border border-[#E8E2DE] rounded-xl px-2.5 py-1.5 text-xs text-[#3E3734] outline-none"
            >
              {PHOTO_TYPES.map((pt) => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-xs text-[#817B77] hover:text-[#3E3734]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddRequirement}
              className="bg-[#8A817C] text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-[#6E6763]"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklistItems.map((item, idx) => {
          const reqType = item.requirementType || "REQUIRED";
          const photoType = item.photoType || "GENERAL";
          const badgeText = `${reqType} • ${photoType}`;

          return (
            <div
              key={idx}
              className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3.5 flex items-center justify-between gap-3 transition-colors hover:border-[#D5C9C2]"
            >
              {/* Left Drag & Title */}
              <div className="flex items-center gap-3">
                <FiGrid className="text-[#A39A94] text-sm cursor-grab shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#3E3734] leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[10px] font-semibold text-[#817B77] tracking-wider uppercase mt-0.5">
                    {badgeText}
                  </p>
                </div>
              </div>

              {/* Right Trash Icon */}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleDeleteItem(idx)}
                  className="text-[#A39A94] hover:text-[#C62828] p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  aria-label="Delete requirement"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              )}
            </div>
          );
        })}

        {checklistItems.length === 0 && (
          <div className="p-8 text-center border border-dashed border-[#E8E2DE] rounded-xl text-xs text-[#817B77]">
            No photo requirements added yet. Click "+ Add Requirement" to add one.
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoChecklist;
