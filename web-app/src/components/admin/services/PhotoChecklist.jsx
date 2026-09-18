import { FiCamera, FiPlus, FiGrid, FiTrash2 } from "react-icons/fi";

const PhotoChecklist = ({ checklistItems, setChecklistItems }) => {
  const handleAddRequirement = () => {
    const newItem = {
      id: Date.now(),
      title: `New Requirement ${checklistItems.length + 1}`,
      badge: "OPTIONAL • STANDARD",
    };
    setChecklistItems([...checklistItems, newItem]);
  };

  const handleDeleteItem = (id) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== id));
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

        <button
          onClick={handleAddRequirement}
          className="text-xs font-semibold text-[#817B77] hover:text-[#3E3734] hover:bg-[#F2EBE5] px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
        >
          <FiPlus className="text-xs" />
          <span>Add Requirement</span>
        </button>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklistItems.map((item) => (
          <div
            key={item.id}
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
                  {item.badge}
                </p>
              </div>
            </div>

            {/* Right Trash Icon */}
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="text-[#A39A94] hover:text-[#C62828] p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              aria-label="Delete requirement"
            >
              <FiTrash2 className="text-sm" />
            </button>
          </div>
        ))}

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
