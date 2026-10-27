import { useState } from "react";
import {
  FiX,
  FiClock,
  FiUser,
  FiShield,
  FiTag,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiCode,
  FiList,
  FiInfo,
} from "react-icons/fi";
import {
  getRoleBadge,
  getActionBadge,
} from "./AuditLogsTable.jsx";
import {
  formatAuditTimestamp,
  sanitizeClientObject,
} from "../../utils/auditUtils.js";

const AuditLogDetailsModal = ({ isOpen, onClose, log = null }) => {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "json"

  if (!isOpen || !log) return null;

  const isSuccess = (log.status || "SUCCESS").toUpperCase() === "SUCCESS";
  const actorName =
    log.actorName ||
    log.actorId?.name ||
    log.actorEmail?.split("@")[0] ||
    "Administrator";
  const actorEmail = log.actorEmail || log.actorId?.email || "—";
  const actorRole = log.actorRole || log.actorId?.role || "ADMIN";

  const safeMetadata = sanitizeClientObject(log.metadata || {});
  const metaEntries = Object.entries(safeMetadata);

  // Detect state transitions for before/after presentation
  const hasStatusChange =
    safeMetadata.previousStatus !== undefined ||
    safeMetadata.newStatus !== undefined ||
    safeMetadata.oldStatus !== undefined;
  const beforeStatus = safeMetadata.previousStatus || safeMetadata.oldStatus;
  const afterStatus = safeMetadata.newStatus || safeMetadata.status;

  const hasRoleChange =
    safeMetadata.previousRoleId !== undefined ||
    safeMetadata.newRoleId !== undefined ||
    safeMetadata.newRoleName !== undefined;
  const afterRoleName = safeMetadata.newRoleName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#EBE6E3] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF7F5] border-b border-[#EBE6E3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {isSuccess ? (
                <FiCheckCircle className="text-lg" />
              ) : (
                <FiAlertCircle className="text-lg" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#2D3436]">
                  Audit Event Details
                </h2>
                {isSuccess ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                    Success
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/70 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                    Failure
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#817B77] mt-0.5 flex items-center gap-2">
                <span>{formatAuditTimestamp(log.createdAt)}</span>
                <span>•</span>
                <span className="font-mono text-[10px]">
                  ID: {log._id || "—"}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#817B77] hover:text-[#2D3436] hover:bg-[#F5F2F0] rounded-lg transition cursor-pointer"
            title="Close modal"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center px-6 pt-3 border-b border-[#EBE6E3] bg-[#FAF8F5] gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pb-2.5 flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === "overview"
                ? "border-[#817B77] text-[#2D3436] font-bold"
                : "border-transparent text-[#817B77] hover:text-[#2D3436]"
            }`}
          >
            <FiList className="text-xs" />
            <span>Event Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("json")}
            className={`pb-2.5 flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === "json"
                ? "border-[#817B77] text-[#2D3436] font-bold"
                : "border-transparent text-[#817B77] hover:text-[#2D3436]"
            }`}
          >
            <FiCode className="text-xs" />
            <span>Raw Metadata</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === "overview" ? (
            <>
              {/* Event Summary Banner */}
              <div className="bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#817B77]">
                  Summary Description
                </span>
                <p className="text-xs text-[#2D3436] font-medium leading-relaxed">
                  {log.description || "No description recorded for this event."}
                </p>
              </div>

              {/* Grid: Actor Details & Event Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Actor Information */}
                <div className="bg-white border border-[#EBE6E3] rounded-xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D3436] pb-2 border-b border-[#F2EBE5]">
                    <FiUser className="text-[#817B77]" />
                    <span>Actor Identity</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="block text-[10px] text-[#817B77]">Name</span>
                      <span className="font-semibold text-[#2D3436]">{actorName}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-[#817B77]">Email Address</span>
                      <span className="font-mono text-[11px] text-[#2D3436]">{actorEmail}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-[#817B77]">Role Snapshot</span>
                      <div className="mt-1">{getRoleBadge(actorRole)}</div>
                    </div>

                    <div>
                      <span className="block text-[10px] text-[#817B77]">Actor ID</span>
                      <span className="font-mono text-[10px] text-[#817B77]">
                        {log.actorId?._id || log.actorId || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target & Action Details */}
                <div className="bg-white border border-[#EBE6E3] rounded-xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D3436] pb-2 border-b border-[#F2EBE5]">
                    <FiTag className="text-[#817B77]" />
                    <span>Target & Action</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="block text-[10px] text-[#817B77]">Action Event</span>
                      <div className="mt-1">{getActionBadge(log.action)}</div>
                    </div>

                    <div>
                      <span className="block text-[10px] text-[#817B77]">Target Entity Type</span>
                      <span className="font-semibold text-[#2D3436]">
                        {log.entityType || "—"}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-[#817B77]">Target Entity ID</span>
                      <span className="font-mono text-[11px] text-[#2D3436] break-all">
                        {log.entityId || "—"}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-[#817B77]">Timestamp</span>
                      <span className="text-[11px] text-[#2D3436]">
                        {formatAuditTimestamp(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* State Transition / Before & After (If Applicable) */}
              {(hasStatusChange || hasRoleChange) && (
                <div className="bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#817B77]">
                    State Transition
                  </span>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    {hasStatusChange && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                          {beforeStatus || "INITIAL"}
                        </span>
                        <FiArrowRight className="text-[#817B77]" />
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {afterStatus}
                        </span>
                      </div>
                    )}
                    {hasRoleChange && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">Reassigned To Role:</span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold">
                          {afterRoleName || "New Role"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Safe Metadata Key-Values */}
              {metaEntries.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#817B77]">
                    Context Metadata
                  </span>
                  <div className="bg-[#FAF8F5] border border-[#EBE6E3] rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {metaEntries.map(([k, v]) => (
                      <div
                        key={k}
                        className="p-2 bg-white rounded-lg border border-[#EBE6E3]/70 space-y-0.5"
                      >
                        <span className="block text-[10px] font-bold text-[#817B77] truncate">
                          {k}
                        </span>
                        <span className="block text-xs font-medium text-[#2D3436] truncate">
                          {typeof v === "object"
                            ? JSON.stringify(v)
                            : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Raw JSON View */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#817B77]">
                <span>Sanitized Event Payload</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                  Sensitive Tokens Redacted
                </span>
              </div>
              <pre className="p-4 bg-[#221F1E] text-[#EEE9E6] rounded-xl text-xs font-mono overflow-x-auto max-h-[350px]">
                {JSON.stringify(
                  {
                    id: log._id,
                    timestamp: log.createdAt,
                    actor: {
                      id: log.actorId?._id || log.actorId,
                      name: actorName,
                      email: actorEmail,
                      role: actorRole,
                    },
                    action: log.action,
                    entityType: log.entityType,
                    entityId: log.entityId,
                    description: log.description,
                    status: log.status,
                    metadata: safeMetadata,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#FAF7F5] border-t border-[#EBE6E3] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#817B77] hover:bg-[#6E6763] text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailsModal;
