import { useNavigate } from "react-router-dom";
import { FiSearch, FiDownload, FiPlus } from "react-icons/fi";

const ProjectToolbar = ({ searchTerm, setSearchTerm, isReadOnly = false }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
      {/* Search Bar */}
      <div className="relative flex-1 w-full">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-sm" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by ID, address, vendor, or service..."
          className="w-full bg-white border border-[#E8E2DE] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
        {/* Export Button */}
        <button
          type="button"
          className="flex items-center gap-1.5 bg-white border border-[#E8E2DE] hover:bg-[#F7F4F2] text-[#4A423F] px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <FiDownload className="text-sm" />
          <span>Export</span>
        </button>

        {/* New Project Button */}
        {!isReadOnly && (
          <button
            type="button"
            onClick={() => navigate("/admin/projects/new")}
            className="flex items-center gap-1.5 bg-[#6E6763] hover:bg-[#5A5450] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <FiPlus className="text-sm" />
            <span>New Project</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectToolbar;
