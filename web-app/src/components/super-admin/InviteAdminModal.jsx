import { useState, useEffect } from "react";
import {
  FiX,
  FiUserPlus,
  FiMail,
  FiUser,
  FiPhone,
  FiShield,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { getRoles } from "../../services/roleService.js";
import { inviteAdminUser } from "../../services/adminUserService.js";

const InviteAdminModal = ({
  isOpen,
  onClose,
  onSuccess = () => {},
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("");

  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [rolesError, setRolesError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  // Load eligible roles when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setName("");
    setEmail("");
    setPhone("");
    setRoleId("");
    setError("");
    setSuccessInfo(null);

    const loadRoles = async () => {
      setLoadingRoles(true);
      setRolesError("");
      try {
        const res = await getRoles();
        if (res?.success && Array.isArray(res?.data)) {
          // Filter out SUPER_ADMIN if returned in Role documents (it is an enum role, but safeguard regardless)
          const eligible = res.data.filter(
            (r) =>
              r.name !== "SUPER_ADMIN" &&
              r.name !== "SUPER ADMIN"
          );
          setAvailableRoles(eligible);
          if (eligible.length > 0) {
            // Default to FULL_ADMIN if available, otherwise first role
            const fullAdmin = eligible.find(
              (r) => r.isSystem || r.name.toUpperCase() === "FULL_ADMIN"
            );
            setRoleId(fullAdmin ? fullAdmin._id : eligible[0]._id);
          }
        } else {
          setAvailableRoles([]);
        }
      } catch (err) {
        console.error("Failed to load eligible roles for admin invitation:", err);
        setRolesError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load roles from the platform."
        );
      } finally {
        setLoadingRoles(false);
      }
    };

    loadRoles();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      setError("Name is required and must be between 2 and 100 characters.");
      return;
    }

    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("A valid email address is required.");
      return;
    }

    if (!trimmedPhone) {
      setError("Phone number is required.");
      return;
    }

    if (!roleId) {
      setError("Please select an assigned role for the administrator.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        roleId,
      };

      const res = await inviteAdminUser(payload);

      setSuccessInfo({
        name: trimmedName,
        email: trimmedEmail,
        emailDispatched: res?.emailDispatched !== false,
      });

      onSuccess();
    } catch (err) {
      console.error("Failed to invite admin:", err);
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to dispatch administrator invitation.";
      setError(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    setSuccessInfo(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#EBE6E3] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF7F5] border-b border-[#EBE6E3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5141F5] text-white flex items-center justify-center shadow-xs">
              <FiUserPlus className="text-base" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D3436]">
                Invite New Administrator
              </h2>
              <p className="text-[11px] text-[#817B77]">
                Create an Admin account with role-based permissions and OTP onboarding.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="p-1.5 text-[#817B77] hover:text-[#2D3436] hover:bg-[#F5F2F0] rounded-lg transition cursor-pointer"
            title="Close modal"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* Modal Body */}
        {successInfo ? (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <FiCheckCircle className="text-base text-emerald-600" />
                <span>Administrator Invitation Created</span>
              </div>
              <p className="text-xs leading-relaxed">
                An invitation record for{" "}
                <strong>{successInfo.name}</strong> ({successInfo.email}) has been
                successfully created.
              </p>
              <div className="bg-white/80 p-3 rounded-lg border border-emerald-200/60 text-[11px] space-y-1">
                <p className="font-semibold text-emerald-800">
                  Onboarding Instructions:
                </p>
                <p className="text-emerald-950">
                  {successInfo.emailDispatched
                    ? "An OTP email was dispatched. The administrator must navigate to the activation portal (/activate-account), verify their OTP, and set a password."
                    : "The invitation account is stored. The administrator must verify their OTP via the activation screen (/activate-account) to complete password setup."}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-2.5 bg-[#817B77] hover:bg-[#6E6763] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 overflow-y-auto flex-1"
          >
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                <FiAlertCircle className="text-sm mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {rolesError && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start gap-2">
                <FiAlertCircle className="text-sm mt-0.5 shrink-0" />
                <span>{rolesError}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-[#2D3436] mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  placeholder="e.g. Jane Doe"
                  className="w-full h-10 pl-9 pr-3 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl text-xs text-[#2D3436] focus:border-[#5141F5] focus:bg-white focus:outline-none transition disabled:opacity-60"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#2D3436] mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  placeholder="jane.doe@fieldcam.com"
                  className="w-full h-10 pl-9 pr-3 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl text-xs text-[#2D3436] focus:border-[#5141F5] focus:bg-white focus:outline-none transition disabled:opacity-60"
                  required
                />
              </div>
              <p className="text-[10px] text-[#817B77] mt-1">
                Invitation and registration OTP will be routed to this email.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#2D3436] mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                  placeholder="+91 98765 43210"
                  className="w-full h-10 pl-9 pr-3 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl text-xs text-[#2D3436] focus:border-[#5141F5] focus:bg-white focus:outline-none transition disabled:opacity-60"
                  required
                />
              </div>
            </div>

            {/* Assigned Role Choice */}
            <div>
              <label className="block text-xs font-semibold text-[#2D3436] mb-1">
                Assigned Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  disabled={submitting || loadingRoles || availableRoles.length === 0}
                  className="w-full h-10 pl-9 pr-8 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl text-xs text-[#2D3436] focus:border-[#5141F5] focus:bg-white focus:outline-none transition disabled:opacity-60 cursor-pointer appearance-none"
                  required
                >
                  {loadingRoles ? (
                    <option value="">Loading available roles...</option>
                  ) : availableRoles.length === 0 ? (
                    <option value="">No roles available</option>
                  ) : (
                    availableRoles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} {r.isSystem ? "(System Role - Full Admin)" : "(Custom Role)"}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[#EBE6E3] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitting}
                className="px-4 py-2 border border-[#EBE6E3] rounded-xl text-xs font-semibold text-[#6E6763] hover:bg-[#F5F2F0] transition cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || loadingRoles || availableRoles.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#817B77] hover:bg-[#6E6763] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {submitting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{submitting ? "Sending Invitation..." : "Send Invitation"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteAdminModal;
