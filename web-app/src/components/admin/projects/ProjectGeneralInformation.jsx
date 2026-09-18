import { FiChevronDown } from "react-icons/fi";

const mockClients = [
  "Apex Field Co.",
  "SiteLine Pro",
  "ClearVision Studios",
  "FieldEye Inc.",
  "OpsLens",
];

const serviceTypes = [
  "Site Inspection",
  "Property Survey",
  "Progress Documentation",
  "Aerial Mapping",
  "Final Inspection",
];

const ProjectGeneralInformation = ({
  projectName,
  setProjectName,
  client,
  setClient,
  serviceType,
  setServiceType,
}) => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
      <h2 className="text-sm font-bold text-[#3E3734]">General Information</h2>

      {/* Project Name Field */}
      <div>
        <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
          Project Name <span className="text-[#C62828]">*</span>
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g., Q4 Logistics Optimization"
          className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
        />
      </div>

      {/* Client & Service Type Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client Field */}
        <div>
          <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
            Client <span className="text-[#C62828]">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              list="client-options"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Select or enter client name"
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] transition-colors"
            />
            <datalist id="client-options">
              {mockClients.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Service Type Field */}
        <div>
          <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
            Service Type <span className="text-[#C62828]">*</span>
          </label>
          <div className="relative">
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors appearance-none cursor-pointer pr-10"
            >
              <option value="" disabled>
                Select service...
              </option>
              {serviceTypes.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectGeneralInformation;
