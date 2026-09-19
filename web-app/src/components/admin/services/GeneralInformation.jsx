import { FiInfo, FiChevronDown } from "react-icons/fi";

const categories = [
  "Maintenance",
  "Inspection",
  "Survey",
  "Mapping",
  "Documentation",
];

const GeneralInformation = ({
  serviceCategory,
  setServiceCategory,
  serviceTypeName,
  setServiceTypeName,
  defaultPrice,
  setDefaultPrice,
  readOnly = false,
}) => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#F2EBE5] text-[#6E6763] flex items-center justify-center shrink-0">
          <FiInfo className="text-sm" />
        </div>
        <h2 className="text-sm font-bold text-[#3E3734]">General Information</h2>
      </div>

      {/* Row 1: Category & Type Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Service Category Select */}
        <div>
          <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
            Service Category
          </label>
          <div className="relative">
            <select
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              disabled={readOnly}
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors appearance-none cursor-pointer pr-10 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
          </div>
        </div>

        {/* Service Type Name Input */}
        <div>
          <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
            Service Type Name
          </label>
          <input
            type="text"
            value={serviceTypeName}
            onChange={(e) => setServiceTypeName(e.target.value)}
            disabled={readOnly}
            placeholder="e.g. Annual HVAC Inspection"
            className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Row 2: Default Price */}
      <div>
        <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
          Default Price
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#817B77]">
            $
          </span>
          <input
            type="text"
            value={defaultPrice}
            onChange={(e) => setDefaultPrice(e.target.value)}
            disabled={readOnly}
            placeholder="0.00"
            className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-[#3E3734] font-semibold outline-none focus:border-[#C8B5AC] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
          />
        </div>
        <p className="text-[11px] text-[#817B77] mt-1.5">
          Base rate charged for this service before add-ons.
        </p>
      </div>
    </div>
  );
};

export default GeneralInformation;
