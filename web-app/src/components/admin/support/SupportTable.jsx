import { useState } from "react";
import TicketPriorityBadge from "./TicketPriorityBadge";
import TicketStatusBadge from "./TicketStatusBadge";
import {
  FiChevronDown,
  FiMoreHorizontal,
  FiEye,
  FiEdit2,
  FiCheckCircle,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";

const ALLOWED_STATUSES = ["Open", "In Progress", "Resolved", "Closed"];
const ALLOWED_PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const SupportTable = ({
  tickets = [],
  onUpdateStatus,
  onEditTicket,
  isReadOnly = false,
}) => {
  // Action Menu State per row
  const [activeMenuId, setActiveMenuId] = useState(null);

  // View Modal State
  const [viewTicket, setViewTicket] = useState(null);

  // Status Modal State
  const [statusTicket, setStatusTicket] = useState(null);
  const [newStatus, setNewStatus] = useState("Open");
  const [statusError, setStatusError] = useState("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  // Edit Modal State
  const [editTicket, setEditTicket] = useState(null);
  const [editSubject, setEditSubject] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editError, setEditError] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const toggleMenu = (id) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleOpenView = (ticket) => {
    setActiveMenuId(null);
    setViewTicket(ticket);
  };

  const handleOpenStatus = (ticket) => {
    setActiveMenuId(null);
    setStatusTicket(ticket);
    setNewStatus(ticket.status || "Open");
    setStatusError("");
  };

  const handleOpenEdit = (ticket) => {
    setActiveMenuId(null);
    setEditTicket(ticket);
    setEditSubject(ticket.subject || "");
    setEditDescription(ticket.description || "");
    setEditPriority(ticket.priority || "Medium");
    setEditError("");
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setStatusError("");
    try {
      setIsSubmittingStatus(true);
      await onUpdateStatus(statusTicket._id, newStatus);
      setStatusTicket(null);
    } catch (err) {
      setStatusError(
        err.response?.data?.message || err.message || "Failed to update status."
      );
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!editSubject.trim()) {
      setEditError("Please enter a subject.");
      return;
    }

    try {
      setIsSubmittingEdit(true);
      await onEditTicket(editTicket._id, {
        subject: editSubject.trim(),
        description: editDescription.trim(),
        priority: editPriority,
      });
      setEditTicket(null);
    } catch (err) {
      setEditError(
        err.response?.data?.message || err.message || "Failed to update ticket."
      );
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatLastUpdate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const diffMinutes = Math.floor((Date.now() - d.getTime()) / (1000 * 60));
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes} min ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F2EBE5] bg-[#FAF7F5] text-[10px] font-bold tracking-wider text-[#A39A94] uppercase">
              <th className="py-3.5 px-6 font-semibold">
                <div className="flex items-center gap-1">
                  <span>TICKET ID</span>
                  <FiChevronDown className="text-xs text-[#A39A94]" />
                </div>
              </th>
              <th className="py-3.5 px-6 font-semibold">
                <div className="flex items-center gap-1">
                  <span>VENDOR</span>
                  <FiChevronDown className="text-xs text-[#A39A94]" />
                </div>
              </th>
              <th className="py-3.5 px-6 font-semibold">SUBJECT</th>
              <th className="py-3.5 px-6 font-semibold">
                <div className="flex items-center gap-1">
                  <span>PRIORITY</span>
                  <FiChevronDown className="text-xs text-[#A39A94]" />
                </div>
              </th>
              <th className="py-3.5 px-6 font-semibold">
                <div className="flex items-center gap-1">
                  <span>STATUS</span>
                  <FiChevronDown className="text-xs text-[#A39A94]" />
                </div>
              </th>
              <th className="py-3.5 px-6 font-semibold">
                <div className="flex items-center gap-1">
                  <span>CREATED</span>
                  <FiChevronDown className="text-xs text-[#A39A94]" />
                </div>
              </th>
              <th className="py-3.5 px-6 w-12 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F4F2] text-xs">
            {tickets.length > 0 ? (
              tickets.map((row) => {
                const tId = row.ticketId || row.id || row._id;
                const vName =
                  row.vendorName ||
                  row.vendorId?.companyName ||
                  row.vendor ||
                  "—";
                const initialsStr =
                  row.initials ||
                  (vName !== "—" ? vName.slice(0, 2).toUpperCase() : "ST");

                return (
                  <tr
                    key={row._id || tId}
                    className="hover:bg-[#FAF7F5] transition-colors relative"
                  >
                    {/* Ticket ID */}
                    <td className="py-4 px-6 font-bold text-[#3E3734]">
                      {tId}
                    </td>

                    {/* Vendor with initials avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: row.avatarBg || "#8A817C" }}
                        >
                          {initialsStr}
                        </div>
                        <span className="font-semibold text-[#3E3734]">
                          {vName}
                        </span>
                      </div>
                    </td>

                    {/* Subject & Last Update */}
                    <td className="py-4 px-6 max-w-md">
                      <div className="font-semibold text-[#3E3734]">
                        {row.subject}
                      </div>
                      <div className="text-[11px] text-[#9E9792] mt-0.5">
                        Last update: {formatLastUpdate(row.lastUpdate || row.updatedAt)}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-6">
                      <TicketPriorityBadge priority={row.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <TicketStatusBadge status={row.status} />
                    </td>

                    {/* Created */}
                    <td className="py-4 px-6 text-[#6E6763] font-medium">
                      {formatDate(row.createdAt || row.created)}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-4 px-6 text-right relative">
                      <button
                        onClick={() => toggleMenu(row._id || tId)}
                        className="text-[#A39A94] hover:text-[#3E3734] p-1.5 rounded-lg hover:bg-[#EAE4DF]/60 transition-colors"
                      >
                        <FiMoreHorizontal className="text-base" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === (row._id || tId) && (
                        <div className="absolute right-6 top-12 z-30 bg-white border border-[#E8E2DE] rounded-xl shadow-lg py-1 w-36 text-left text-xs font-semibold animate-fade-in">
                          <button
                            onClick={() => handleOpenView(row)}
                            className="w-full px-3 py-2 text-[#3E3734] hover:bg-[#FAF7F5] flex items-center gap-2"
                          >
                            <FiEye className="text-xs text-[#817B77]" />
                            <span>View Details</span>
                          </button>
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={() => handleOpenStatus(row)}
                                className="w-full px-3 py-2 text-[#3E3734] hover:bg-[#FAF7F5] flex items-center gap-2 border-t border-[#F2EBE5]"
                              >
                                <FiCheckCircle className="text-xs text-[#817B77]" />
                                <span>Change Status</span>
                              </button>
                              <button
                                onClick={() => handleOpenEdit(row)}
                                className="w-full px-3 py-2 text-[#3E3734] hover:bg-[#FAF7F5] flex items-center gap-2 border-t border-[#F2EBE5]"
                              >
                                <FiEdit2 className="text-xs text-[#817B77]" />
                                <span>Edit Ticket</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 px-6 text-center text-[#817B77]"
                >
                  <p className="text-sm font-semibold">No tickets found</p>
                  <p className="text-xs mt-1">
                    Try adjusting your search query or filter settings.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Ticket Modal */}
      {viewTicket && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E8E2DE] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#3E3734]">
                  {viewTicket.subject}
                </h3>
                <p className="text-xs text-[#817B77]">
                  {viewTicket.ticketId} — Created {formatDate(viewTicket.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setViewTicket(null)}
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold text-[#817B77]">Vendor:</span>{" "}
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white shrink-0"
                    style={{ backgroundColor: viewTicket.avatarBg || "#8A817C" }}
                  >
                    {viewTicket.initials || "ST"}
                  </div>
                  <span className="text-[#3E3734] font-semibold">
                    {viewTicket.vendorName || viewTicket.vendorId?.companyName || "—"}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-semibold text-[#817B77]">Project:</span>{" "}
                <p className="text-[#3E3734] font-medium mt-0.5">
                  {viewTicket.projectId?.projectName || viewTicket.projectId?.projectId || (typeof viewTicket.projectId === "string" ? viewTicket.projectId : "None")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#817B77]">Priority:</span>
                <TicketPriorityBadge priority={viewTicket.priority} />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#817B77]">Status:</span>
                <TicketStatusBadge status={viewTicket.status} />
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-[#817B77]">Last Update:</span>{" "}
                <span className="text-[#3E3734] font-medium">
                  {formatLastUpdate(viewTicket.lastUpdate || viewTicket.updatedAt)}
                </span>
              </div>
            </div>

            {viewTicket.description && (
              <div className="pt-2 border-t border-[#F2EBE5]">
                <h4 className="text-xs font-bold text-[#3E3734] mb-1">Description</h4>
                <p className="text-xs text-[#6E6763] bg-[#FAF7F5] p-3.5 rounded-xl border border-[#E8E2DE] leading-relaxed">
                  {viewTicket.description}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-[#F2EBE5] flex justify-end">
              <button
                onClick={() => setViewTicket(null)}
                className="bg-[#F2EBE5] text-[#3E3734] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#EAE4DF] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusTicket && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStatus}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E8E2DE] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
              <h3 className="text-sm font-bold text-[#3E3734]">
                Change Ticket Status
              </h3>
              <button
                type="button"
                onClick={() => setStatusTicket(null)}
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <p className="text-xs text-[#817B77]">
              Ticket: <span className="font-semibold text-[#3E3734]">{statusTicket.ticketId}</span>
            </p>

            {statusError && (
              <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{statusError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1">
                Select Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC]"
              >
                {ALLOWED_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-[#F2EBE5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStatusTicket(null)}
                disabled={isSubmittingStatus}
                className="bg-white border border-[#E8E2DE] text-[#6E6763] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#F2EBE5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingStatus}
                className="bg-[#8A817C] text-white font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#6E6763] transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <FiCheckCircle className="text-xs" />
                <span>{isSubmittingStatus ? "Updating..." : "Save Status"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {editTicket && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E8E2DE] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
              <h3 className="text-sm font-bold text-[#3E3734]">
                Edit Support Ticket
              </h3>
              <button
                type="button"
                onClick={() => setEditTicket(null)}
                className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-lg"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <p className="text-xs text-[#817B77]">
              Ticket: <span className="font-semibold text-[#3E3734]">{editTicket.ticketId}</span>
            </p>

            {editError && (
              <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1">
                Subject <span className="text-[#C62828]">*</span>
              </label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1">
                Priority
              </label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#3E3734] font-medium outline-none focus:border-[#C8B5AC]"
              >
                {ALLOWED_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3E3734] mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl p-3 text-xs text-[#3E3734] outline-none focus:border-[#C8B5AC]"
              />
            </div>

            <div className="pt-3 border-t border-[#F2EBE5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditTicket(null)}
                disabled={isSubmittingEdit}
                className="bg-white border border-[#E8E2DE] text-[#6E6763] font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#F2EBE5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingEdit}
                className="bg-[#8A817C] text-white font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#6E6763] transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <FiCheckCircle className="text-xs" />
                <span>{isSubmittingEdit ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportTable;
