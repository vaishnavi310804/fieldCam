import {
  FiClock,
  FiUser,
  FiActivity,
  FiTag,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiShield,
  FiInbox,
} from "react-icons/fi";

import {
  formatAuditTimestamp,
  formatActionTitle,
  getActionColorClass,
  getRoleColorClass,
} from "../../utils/auditUtils.js";

export { formatAuditTimestamp };

/**
 * Visual styling for actor role badge
 */
export const getRoleBadge = (role) => {
  const normalized = (role || "").toUpperCase();
  const colorClass = getRoleColorClass(role);
  const isSuper = normalized === "SUPER_ADMIN";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${colorClass}`}
    >
      {isSuper && <FiShield className="text-[9px]" />}
      {normalized === "SUPER_ADMIN"
        ? "Super Admin"
        : normalized === "FULL_ADMIN"
        ? "Full Admin"
        : normalized === "ADMIN"
        ? "Admin"
        : role || "Custom Role"}
    </span>
  );
};

/**
 * Visual styling for action badge
 */
export const getActionBadge = (action = "") => {
  const badgeColor = getActionColorClass(action);
  const readable = formatActionTitle(action);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[11px] font-semibold whitespace-nowrap ${badgeColor}`}
      title={action}
    >
      {readable}
    </span>
  );
};

const AuditLogsTable = ({
  logs = [],
  loading = false,
  onViewDetails = () => {},
}) => {
  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#817B77] flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-2 border-[#817B77] border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Loading administrative activity records...</span>
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="p-16 text-center text-[#817B77]">
            <FiInbox className="text-4xl mx-auto mb-2 text-[#A39A94]" />
            <p className="text-sm font-bold text-[#2D3436]">
              No audit logs found
            </p>
            <p className="text-xs text-[#A39A94] mt-1 max-w-sm mx-auto">
              No administrative activity matches your current filters. Try resetting
              filters or expanding the search criteria.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-[#FAF7F5] border-b border-[#EBE6E3] text-[10px] font-bold text-[#817B77] uppercase tracking-wider">
                <th className="py-3.5 px-5">Date & Time</th>
                <th className="py-3.5 px-5">Actor</th>
                <th className="py-3.5 px-5">Action</th>
                <th className="py-3.5 px-5">Target Entity</th>
                <th className="py-3.5 px-5">Description</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F2EBE5] text-xs">
              {logs.map((item) => {
                const isSuccess = (item.status || "SUCCESS").toUpperCase() === "SUCCESS";
                const actorName =
                  item.actorName ||
                  item.actorId?.name ||
                  item.actorEmail?.split("@")[0] ||
                  "Administrator";
                const actorEmail = item.actorEmail || item.actorId?.email || "—";
                const actorRole = item.actorRole || item.actorId?.role || "ADMIN";

                return (
                  <tr
                    key={item._id || `${item.action}-${item.createdAt}`}
                    className="hover:bg-[#FAF7F5]/60 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="py-3.5 px-5 whitespace-nowrap text-[#6E6763]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <FiClock className="text-[#A39A94] shrink-0 text-xs" />
                        <span className="text-[11px]">{formatAuditTimestamp(item.createdAt)}</span>
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#2D3436] truncate max-w-[140px]">
                            {actorName}
                          </span>
                          {getRoleBadge(actorRole)}
                        </div>
                        <span className="block text-[11px] text-[#817B77] truncate max-w-[180px]">
                          {actorEmail}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5">
                      {getActionBadge(item.action)}
                    </td>

                    {/* Target Entity */}
                    <td className="py-3.5 px-5">
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2D3436]">
                          <FiTag className="text-[#A39A94] text-[10px]" />
                          {item.entityType || "Entity"}
                        </span>
                        <span
                          className="block text-[10px] font-mono text-[#817B77] truncate max-w-[120px]"
                          title={item.entityId}
                        >
                          {item.entityId ? `#${String(item.entityId).slice(-8)}` : "—"}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-5 max-w-[280px]">
                      <p
                        className="text-xs text-[#2D3436] font-normal truncate"
                        title={item.description}
                      >
                        {item.description || "—"}
                      </p>
                    </td>

                    {/* Outcome / Status */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {isSuccess ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                          <FiCheckCircle className="text-[9px]" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/70 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                          <FiAlertCircle className="text-[9px]" />
                          Failure
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewDetails(item)}
                        className="inline-flex items-center gap-1.5 text-[#6E6763] hover:text-[#817B77] border border-[#EBE6E3] hover:border-[#817B77] rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
                        title="View audit event details"
                      >
                        <FiEye className="text-xs" />
                      </button>
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

export default AuditLogsTable;
