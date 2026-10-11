import { useState } from "react";
import { FiX, FiCheck, FiAlertCircle } from "react-icons/fi";

const EditStaffModalDialog = ({ onClose, staff, onUpdateStaff }) => {
  const [name, setName] = useState(staff.name || "");
  const [phone, setPhone] = useState(staff.phone || "");
  const [title, setTitle] = useState(staff.title || "");
  const [location, setLocation] = useState(staff.location || "");
  const [department, setDepartment] = useState(staff.department || "");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter the staff member's name.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdateStaff(staff._id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        title: title.trim() || undefined,
        location: location.trim() || undefined,
        department: department.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update staff member details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-[#EEE9E6] border border-[#E8E2DE] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#3E3734]">Edit Staff Details</h2>
            <p className="text-xs text-[#817B77] mt-0.5">
              Update profile and operational details for <span className="font-bold text-[#3E3734]">{staff.name}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center text-[#817B77] hover:text-[#3E3734] hover:bg-[#EAE4DF] transition-colors cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>

        {error && (
          <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
            <FiAlertCircle className="shrink-0 text-sm" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={staff.email || ""}
              disabled
              className="w-full bg-[#EAE4DF] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#817B77] outline-none cursor-not-allowed opacity-80"
              title="Email address cannot be modified once provisioned."
            />
            <span className="text-[10px] text-[#A39A94] mt-1 block">
              Identity email is managed via authentication credentials.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                Role / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead Photographer"
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Field Inspection"
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3E3734] mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Austin, TX"
              className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC] transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2DE]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-[#E8E2DE] bg-white text-xs font-bold text-[#817B77] hover:bg-[#FAF7F5] hover:text-[#3E3734] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#C87A65] hover:bg-[#B36854] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <FiCheck size={14} />
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditStaffModal = ({ isOpen, onClose, staff, onUpdateStaff }) => {
  if (!isOpen || !staff) return null;

  return (
    <EditStaffModalDialog
      key={staff._id || "edit-modal"}
      onClose={onClose}
      staff={staff}
      onUpdateStaff={onUpdateStaff}
    />
  );
};

export default EditStaffModal;
