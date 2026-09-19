import { FiChevronDown, FiCalendar, FiMapPin, FiMap } from "react-icons/fi";

const ProjectOperationalDetails = ({
  vendorId,
  setVendorId,
  deadline,
  setDeadline,
  location,
  setLocation,
  vendors = [],
}) => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
      <h2 className="text-sm font-bold text-[#3E3734]">Operational Details</h2>

      {/* Row 1: Assigned Vendor & Deadline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assigned Vendor */}
        <div>
          <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
            Assigned Vendor
          </label>
          <div className="relative">
            <select
              value={vendorId || ""}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors appearance-none cursor-pointer pr-10"
            >
              <option value="">
                Select vendor (Optional)...
              </option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.companyName} ({v.contactName || "Active"})
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
            Deadline <span className="text-[#C62828]">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors cursor-pointer"
            />
            <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
          Location <span className="text-[#C62828]">*</span>
        </label>
        <div className="relative">
          <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="San Francisco, CA (or enter address)"
            className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
          />
        </div>

        {/* Interactive Map Preview Placeholder */}
        <div className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-8 flex flex-col items-center justify-center text-center text-[#A39A94] mt-3">
          <FiMap className="text-2xl mb-2 text-[#C8B5AC]" />
          <span className="text-xs font-medium">
            Interactive map preview for selected location
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectOperationalDetails;
