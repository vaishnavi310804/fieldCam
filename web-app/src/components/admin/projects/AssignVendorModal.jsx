import { useState, useEffect } from "react";
import { getVendors } from "../../../services/vendorService";
import { assignVendorToProject } from "../../../services/projectService";
import { usePermissions } from "../../../hooks/usePermissions";
import {
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronDown,
  FiFolder,
  FiMapPin,
  FiTag,
  FiUserCheck,
} from "react-icons/fi";

const AssignVendorModal = ({ isOpen, onClose, project, onAssignSuccess }) => {
  const { can } = usePermissions();
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !project) return;

    const fetchVendorsData = async () => {
      setSelectedVendorId("");
      setError("");
      setLoadingVendors(true);

      try {
        const res = await getVendors();
        const vendorList = Array.isArray(res) ? res : res.data || [];
        const activeVendors = vendorList.filter((v) => v.status === "Active");
        setVendors(activeVendors);

        if (activeVendors.length > 0) {
          setSelectedVendorId(activeVendors[0]._id);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load active vendors"
        );
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendorsData();
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!can("PROJECTS", "ASSIGN")) return;
    setError("");

    if (!selectedVendorId) {
      setError("Please select a vendor to assign.");
      return;
    }

    try {
      setIsSubmitting(true);
      await assignVendorToProject(project._id || project.id, selectedVendorId);

      if (onAssignSuccess) {
        await onAssignSuccess();
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to assign vendor to project."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVendor = vendors.find((v) => v._id === selectedVendorId);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-[#EEE9E6] border border-[#E8E2DE] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#3E3734]">Assign Vendor</h2>
            <p className="text-xs text-[#817B77] mt-0.5">
              Assign project{" "}
              <span className="font-semibold text-[#3E3734]">
                {project.projectName || project.projectId}
              </span>{" "}
              to an active vendor.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-[#817B77] hover:text-[#3E3734] p-1.5 rounded-xl hover:bg-[#EAE4DF] transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <FiAlertCircle className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5"
        >
          {/* Project Details Box */}
          <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-[#3E3734] flex items-center gap-1.5">
              <FiFolder className="text-[#8A817C]" />
              <span>Project Information</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                  Project Code
                </span>
                <span className="font-semibold text-[#3E3734]">
                  {project.projectId || "N/A"}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                  Service Type
                </span>
                <span className="font-semibold text-[#3E3734] flex items-center gap-1 mt-0.5">
                  <FiTag className="text-[10px] text-[#817B77]" />
                  {project.serviceTypeName || project.serviceId?.serviceTypeName || "General"}
                </span>
              </div>

              <div className="col-span-2">
                <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                  Location
                </span>
                <span className="font-semibold text-[#3E3734] flex items-center gap-1 mt-0.5">
                  <FiMapPin className="text-[10px] text-[#817B77]" />
                  {project.location || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {loadingVendors ? (
            <div className="py-6 text-center text-xs text-[#817B77]">
              Loading active vendors...
            </div>
          ) : vendors.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#817B77]">
              No active vendors available in the system.
            </div>
          ) : (
            <>
              {/* Vendor Select Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                  Select Vendor <span className="text-[#C62828]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC] transition-colors appearance-none cursor-pointer pr-10"
                  >
                    <option value="">-- Choose a vendor --</option>
                    {vendors.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.companyName} ({v.contactName || "Active"})
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs pointer-events-none" />
                </div>
              </div>

              {/* Selected Vendor Preview */}
              {selectedVendor && (
                <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-3.5 flex items-center gap-3 text-xs">
                  <div className="w-8 h-8 rounded-full bg-[#8A817C] text-white font-bold flex items-center justify-center shrink-0">
                    <FiUserCheck className="text-sm" />
                  </div>
                  <div>
                    <span className="font-bold text-[#3E3734] block">
                      {selectedVendor.companyName}
                    </span>
                    <span className="text-[#817B77] text-[11px]">
                      Contact: {selectedVendor.contactName || "N/A"} • Location: {selectedVendor.location || "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F2EBE5]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-white hover:bg-[#F2EBE5] text-[#6E6763] hover:text-[#3E3734] border border-[#E8E2DE] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <FiX className="text-xs" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || loadingVendors || !selectedVendorId || !can("PROJECTS", "ASSIGN")}
              className="bg-[#8A817C] hover:bg-[#6E6763] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <FiCheckCircle className="text-xs" />
              <span>{isSubmitting ? "Assigning..." : "Assign Vendor"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignVendorModal;
