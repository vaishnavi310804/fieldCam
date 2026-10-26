import {
  FiUsers,
  FiShield,
  FiLock,
  FiEdit2,
  FiPower,
  FiMail,
  FiPhone,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

const formatActivityTime = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "AD";
};

const AdminUsersTable = ({
  users = [],
  loading = false,
  onReassignRole = () => {},
  onChangeStatus = () => {},
}) => {
  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#817B77] flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#817B77] border-t-transparent rounded-full animate-spin" />
            <span>Loading administrator accounts...</span>
          </div>
        ) : !users || users.length === 0 ? (
          <div className="p-12 text-center text-[#817B77]">
            <FiUsers className="text-3xl mx-auto mb-2 text-[#A39A94]" />
            <p className="text-xs font-bold text-[#2D3436]">
              No administrators found
            </p>
            <p className="text-[11px] text-[#A39A94] mt-0.5">
              Try adjusting your search criteria, status filters, or invite a new
              Admin.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F5] border-b border-[#EBE6E3] text-[10px] font-bold text-[#817B77] uppercase tracking-wider">
                <th className="py-3.5 px-6">Administrator</th>
                <th className="py-3.5 px-6">Contact Info</th>
                <th className="py-3.5 px-6">Assigned Role</th>
                <th className="py-3.5 px-6">Account Status</th>
                <th className="py-3.5 px-6">Created / Last Login</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F2EBE5] text-xs">
              {users.map((admin) => {
                const isSuperAdmin = admin.role === "SUPER_ADMIN";
                const isVerified = Boolean(admin.isVerified);
                const roleDoc = admin.roleId;

                // Status presentation logic
                let statusBadge;
                if (admin.status === "ACTIVE") {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold px-2.5 py-1 rounded-full text-[11px]">
                      <FiCheckCircle className="text-[10px]" />
                      Active
                    </span>
                  );
                } else if (admin.status === "SUSPENDED") {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/70 font-semibold px-2.5 py-1 rounded-full text-[11px]">
                      <FiAlertCircle className="text-[10px]" />
                      Suspended
                    </span>
                  );
                } else {
                  // INACTIVE
                  if (!isVerified) {
                    statusBadge = (
                      <span
                        className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/70 font-semibold px-2.5 py-1 rounded-full text-[11px]"
                        title="Administrator was invited and has not completed OTP password activation"
                      >
                        <FiClock className="text-[10px]" />
                        Invited / Pending
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/70 font-semibold px-2.5 py-1 rounded-full text-[11px]">
                        Inactive
                      </span>
                    );
                  }
                }

                return (
                  <tr
                    key={admin._id}
                    className="hover:bg-[#FAF7F5]/60 transition-colors group"
                  >
                    {/* Administrator Identity */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                            isSuperAdmin
                              ? "bg-[#5141F5] text-white"
                              : "bg-[#F5F2F0] text-[#2D3436] border border-[#EBE6E3]"
                          }`}
                        >
                          {getInitials(admin.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#2D3436] text-xs truncate">
                              {admin.name}
                            </span>
                            {isSuperAdmin && (
                              <span className="bg-purple-50 text-purple-700 border border-purple-200/70 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
                                Super Admin
                              </span>
                            )}
                          </div>
                          <span className="block text-[10px] text-[#817B77] truncate">
                            ID: {admin._id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-[#2D3436]">
                          <FiMail className="text-[11px] text-[#817B77] shrink-0" />
                          <span className="truncate">{admin.email}</span>
                        </div>
                        {admin.phone ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#817B77]">
                            <FiPhone className="text-[10px] text-[#A39A94] shrink-0" />
                            <span>{admin.phone}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#A39A94] italic">
                            No phone provided
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assigned Role */}
                    <td className="py-4 px-6">
                      {isSuperAdmin ? (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200/70 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                            SUPER_ADMIN
                          </span>
                        </div>
                      ) : roleDoc ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-[#2D3436] text-xs">
                            {roleDoc.name}
                          </span>
                          {roleDoc.isSystem ? (
                            <span className="bg-purple-50 text-purple-700 border border-purple-200/70 font-semibold px-1.5 py-0.5 rounded text-[9px]">
                              System Role
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-1.5 py-0.5 rounded text-[9px]">
                              Custom Role
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                            FULL_ADMIN
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="py-4 px-6">{statusBadge}</td>

                    {/* Created Date / Last Login */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5 text-xs">
                        <span className="block text-[#2D3436]">
                          Joined {formatActivityTime(admin.createdAt)}
                        </span>
                        <span className="block text-[10px] text-[#817B77]">
                          Last login:{" "}
                          {admin.lastLogin
                            ? formatActivityTime(admin.lastLogin)
                            : "Never"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isSuperAdmin ? (
                          <span
                            className="p-1.5 text-[#C4BEBA] cursor-not-allowed"
                            title="Super Admin accounts are permanently protected and cannot be modified here"
                          >
                            <FiLock className="text-sm" />
                          </span>
                        ) : (
                          <>
                            {/* Reassign Role Action */}
                            <button
                              type="button"
                              onClick={() => onReassignRole(admin)}
                              className="p-1.5 text-[#817B77] hover:text-[#5141F5] hover:bg-[#EEEDFE] rounded-lg transition cursor-pointer"
                              title="Reassign Admin Role"
                              aria-label={`Reassign role for ${admin.name}`}
                            >
                              <FiShield className="text-sm" />
                            </button>

                            {/* Change Account Status Action */}
                            <button
                              type="button"
                              onClick={() => onChangeStatus(admin)}
                              className="p-1.5 text-[#817B77] hover:text-[#2D3436] hover:bg-[#F5F2F0] rounded-lg transition cursor-pointer"
                              title="Change Account Status"
                              aria-label={`Change status for ${admin.name}`}
                            >
                              <FiPower className="text-sm" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsersTable;
