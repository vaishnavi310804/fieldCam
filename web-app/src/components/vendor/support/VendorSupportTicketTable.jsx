import React, { useState, useMemo, useEffect } from "react";
import {
  FiSearch,
  FiLifeBuoy,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const VendorSupportTicketTable = ({ tickets = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusCounts = useMemo(() => {
    const counts = {
      All: tickets.length,
      Open: 0,
      "In Progress": 0,
      Resolved: 0,
      Closed: 0,
    };

    tickets.forEach((t) => {
      if (counts[t.status] !== undefined) {
        counts[t.status] += 1;
      }
    });

    return counts;
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    if (statusFilter !== "All") {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((t) => {
        const id = (t.ticketId || t._id || "").toLowerCase();
        const subject = (t.subject || "").toLowerCase();
        const desc = (t.description || "").toLowerCase();
        const pTitle = (
          t.projectId?.projectName ||
          t.projectId?.projectId ||
          ""
        ).toLowerCase();
        return (
          id.includes(q) ||
          subject.includes(q) ||
          desc.includes(q) ||
          pTitle.includes(q)
        );
      });
    }

    return result;
  }, [tickets, statusFilter, searchTerm]);

  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return "bg-[#E3F2FD] text-[#1565C0]";
      case "In Progress":
        return "bg-[#FFF3E0] text-[#E65100]";
      case "Resolved":
        return "bg-[#E8F5E9] text-[#2E7D32]";
      case "Closed":
        return "bg-[#EEEEEE] text-[#616161]";
      default:
        return "bg-[#EEEEEE] text-[#616161]";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Low":
        return "text-[#2E7D32]";
      case "Medium":
        return "text-[#1565C0]";
      case "High":
        return "text-[#E65100]";
      case "Urgent":
        return "text-[#C62828] font-bold";
      default:
        return "text-[#616161]";
    }
  };

  const filterOptions = [
    { id: "All", label: "All", dotColor: null },
    { id: "Open", label: "Open", dotColor: "bg-[#1565C0]" },
    { id: "In Progress", label: "In Progress", dotColor: "bg-[#E65100]" },
    { id: "Resolved", label: "Resolved", dotColor: "bg-[#2E7D32]" },
    { id: "Closed", label: "Closed", dotColor: "bg-[#616161]" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E8E2DE] p-5 shadow-2xs space-y-3.5">
      {/* Section Title & Compact Search Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#3E3734]">Your Tickets</h3>
          <p className="text-[11px] text-[#817B77] whitespace-nowrap">
            Track and manage all your support requests
          </p>
        </div>

        {/* Search Bar - Fixed 260px inline style prevents stretching */}
        <div
          style={{ width: "260px", maxWidth: "100%" }}
          className="relative shrink-0"
        >
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#817B77]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets..."
            style={{ width: "100%" }}
            className="bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#3E3734] placeholder-[#A39A94] outline-none focus:border-[#C8B5AC] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Filter Pills Row */}
      <div className="flex flex-wrap items-center gap-2 py-1">
        {filterOptions.map((opt) => {
          const isActive = statusFilter === opt.id;
          const count = statusCounts[opt.id] ?? 0;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatusFilter(opt.id)}
              style={
                isActive
                  ? { backgroundColor: "#C5B4AB", color: "#FFFFFF", borderColor: "#C5B4AB" }
                  : { backgroundColor: "#FFFFFF", color: "#4A423F", borderColor: "#E8E2DE" }
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                isActive ? "shadow-2xs font-bold" : "hover:bg-[#FAF7F5]"
              }`}
            >
              {opt.dotColor && (
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${opt.dotColor}`} />
              )}
              <span>{opt.label}</span>
              <span
                style={
                  isActive
                    ? { backgroundColor: "rgba(255, 255, 255, 0.3)", color: "#FFFFFF" }
                    : { backgroundColor: "#F4F0ED", color: "#5D4037" }
                }
                className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0"
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Area */}
      {loading ? (
        <div className="py-6 space-y-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-9 bg-[#FAF7F5] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="py-10 text-center">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF7F5] text-[#817B77] flex items-center justify-center mx-auto mb-2">
            <FiLifeBuoy size={20} />
          </div>
          <h4 className="text-xs font-bold text-[#3E3734] mb-1">
            {tickets.length === 0 ? "No Support Tickets" : "No Matching Tickets"}
          </h4>
          <p className="text-[11px] text-[#817B77] max-w-sm mx-auto">
            {tickets.length === 0
              ? "You haven't submitted any support tickets yet. Click '+ New Ticket' above to get started."
              : "No support tickets match your search or status filter."}
          </p>
          {statusFilter !== "All" || searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("All");
                setSearchTerm("");
              }}
              className="mt-3 px-3 py-1.5 bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl text-xs font-bold text-[#3E3734] hover:bg-[#EAE4DF] transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-[#817B77] uppercase tracking-wider border-b border-[#E8E2DE] pb-1.5">
                  <th className="py-2 px-3">TICKET</th>
                  <th className="py-2 px-3">SUBJECT</th>
                  <th className="py-2 px-3">PRIORITY</th>
                  <th className="py-2 px-3">STATUS</th>
                  <th className="py-2 px-3">CREATED</th>
                  <th className="py-2 px-3">LAST UPDATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2DE]/50 text-xs text-[#3E3734]">
                {paginatedTickets.map((ticket) => (
                  <tr
                    key={ticket._id || ticket.ticketId}
                    className="hover:bg-[#FAF7F5]/80 transition-colors"
                  >
                    {/* Ticket ID */}
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[#5C6BC0]">
                        {ticket.ticketId || ticket._id}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="py-2.5 px-3 max-w-xs">
                      <span className="font-semibold text-[#3E3734] block truncate">
                        {ticket.subject}
                      </span>
                      {ticket.projectId ? (
                        <span className="text-[10px] text-[#817B77] block font-medium truncate">
                          Project: {ticket.projectId.projectName || ticket.projectId.projectId || "Assigned"}
                        </span>
                      ) : null}
                    </td>

                    {/* Priority */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-xs font-semibold ${getPriorityBadge(
                          ticket.priority || "Medium"
                        )}`}
                      >
                        {ticket.priority || "Medium"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadge(
                          ticket.status || "Open"
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{ticket.status || "Open"}</span>
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="py-2.5 px-3 text-[#817B77] font-medium whitespace-nowrap">
                      {formatDate(ticket.createdAt)}
                    </td>

                    {/* Last Update */}
                    <td className="py-2.5 px-3 text-[#817B77] font-medium whitespace-nowrap">
                      {formatDate(ticket.lastUpdate || ticket.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-2.5 border-t border-[#E8E2DE] text-xs text-[#817B77]">
            <span>
              Showing {filteredTickets.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
              {Math.min(currentPage * pageSize, filteredTickets.length)} of {filteredTickets.length} tickets
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-lg border border-[#E8E2DE] bg-white text-[#3E3734] hover:bg-[#FAF7F5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FiChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-6 h-6 rounded-lg text-[11px] font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                      currentPage === page
                        ? "bg-[#D7CCC8] text-[#3E3734] font-bold shadow-2xs"
                        : "bg-white text-[#817B77] border border-[#E8E2DE] hover:bg-[#FAF7F5]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded-lg border border-[#E8E2DE] bg-white text-[#3E3734] hover:bg-[#FAF7F5] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FiChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VendorSupportTicketTable;
