import { useState, useEffect, useMemo } from "react";
import {
  FiSearch,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const PaymentHistoryTable = ({
  invoices = [],
  loading = false,
  formatCurrency,
  formatDate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Dynamic counts for status filter pills
  const filterCounts = useMemo(() => {
    const counts = {
      All: invoices.length,
      Paid: 0,
      Approved: 0,
      Pending: 0,
    };

    invoices.forEach((inv) => {
      if (inv.status === "Paid") counts.Paid += 1;
      if (inv.status === "Approved") counts.Approved += 1;
      if (inv.status === "Pending") counts.Pending += 1;
    });

    return counts;
  }, [invoices]);

  // Filter options adapted from VendorSupportTicketTable visual pattern
  const filterOptions = [
    { id: "All", label: "All", dotColor: null },
    { id: "Paid", label: "Paid", dotColor: "bg-[#00B894]" },
    { id: "Approved", label: "Approved", dotColor: "bg-[#0984E3]" },
    { id: "Pending", label: "Pending", dotColor: "bg-[#E17055]" },
  ];

  // Filtered & Searched invoices
  const processedInvoices = useMemo(() => {
    let result = [...invoices];

    if (statusFilter !== "All") {
      result = result.filter((inv) => inv.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((inv) => {
        const invId = (inv.invoiceId || inv._id || "").toLowerCase();
        const pTitle = (inv.projectTitle || inv.projectId?.projectName || "").toLowerCase();
        const vName = (inv.vendorName || "").toLowerCase();
        return invId.includes(q) || pTitle.includes(q) || vName.includes(q);
      });
    }

    return result;
  }, [invoices, statusFilter, searchTerm]);

  // Pagination calculation
  const totalPages = Math.ceil(processedInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedInvoices.slice(start, start + pageSize);
  }, [processedInvoices, currentPage]);

  // Reset pagination when search/filter/data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, invoices]);

  return (
    <div className="bg-white rounded-2xl border border-[#EBE6E3] p-6 shadow-xs space-y-3.5">
      {/* Header & Search Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-1">
        <div>
          <h3 className="text-base font-bold text-[#2D3436]">Payment History</h3>
          <p className="text-xs text-[#817B77] font-medium whitespace-nowrap">
            All invoices and payment records
          </p>
        </div>

        {/* Compact Search Input (260px desktop width) */}
        <div
          style={{ width: "260px", maxWidth: "100%" }}
          className="relative shrink-0"
        >
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#817B77]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoices..."
            style={{ width: "100%" }}
            className="bg-[#F4F0ED] border border-[#EBE6E3] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#2D3436] placeholder-[#A09893] outline-none focus:border-[#6C5CE7] transition-colors"
          />
        </div>
      </div>

      {/* Filter Pills Row — Identical visual pattern to Ticket Support */}
      <div className="flex flex-wrap items-center gap-2 py-1">
        {filterOptions.map((opt) => {
          const isActive = statusFilter === opt.id;
          const count = filterCounts[opt.id] ?? 0;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatusFilter(opt.id)}
              style={
                isActive
                  ? { backgroundColor: "#C5B4AB", color: "#FFFFFF", borderColor: "#C5B4AB" }
                  : { backgroundColor: "#FFFFFF", color: "#4A423F", borderColor: "#EBE6E3" }
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

      {/* Table / Loading / Empty State */}
      {loading ? (
        <div className="p-8 space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-10 bg-[#F4F0ED] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : processedInvoices.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F0ED] text-[#817B77] flex items-center justify-center mx-auto mb-3">
            <FiFileText size={24} />
          </div>
          <h4 className="text-sm font-bold text-[#2D3436] mb-1">
            {invoices.length === 0 ? "No Invoices Found" : "No Matching Invoices"}
          </h4>
          <p className="text-xs text-[#817B77] max-w-sm mx-auto">
            {invoices.length === 0
              ? "There are currently no invoices generated for your vendor account."
              : "No invoices match your selected filter or search criteria."}
          </p>
          {statusFilter !== "All" || searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("All");
                setSearchTerm("");
              }}
              className="mt-4 px-4 py-2 bg-[#F4F0ED] border border-[#EBE6E3] rounded-xl text-xs font-bold text-[#2D3436] hover:bg-[#EBE6E3] transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-[#817B77] uppercase tracking-wider border-b border-[#EBE6E3] pb-2">
                <th className="py-3 px-3">INVOICE</th>
                <th className="py-3 px-3">PROJECT</th>
                <th className="py-3 px-3">AMOUNT</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">DUE DATE</th>
                <th className="py-3 px-3">PAID ON</th>
                <th className="py-3 px-3">METHOD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE6E3] text-xs font-medium text-[#2D3436]">
              {paginatedInvoices.map((inv) => {
                const projectTitle = inv.projectTitle || inv.projectId?.projectName || "—";
                const projectCode = inv.projectId?.projectId || inv.projectId?.code || null;

                return (
                  <tr key={inv._id || inv.invoiceId} className="hover:bg-[#F4F0ED]/50 transition-colors">
                    {/* Invoice Identifier Column */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <FiFileText className="text-[#817B77] shrink-0" size={14} />
                        <span className="font-bold text-[#6C5CE7] hover:underline cursor-pointer">
                          {inv.invoiceId || inv._id || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Project Name Column */}
                    <td className="py-3.5 px-3 max-w-xs">
                      <span className="font-bold text-[#2D3436] block truncate">
                        {projectTitle}
                      </span>
                      {projectCode ? (
                        <span className="text-[10px] text-[#817B77] block font-semibold truncate">
                          {projectCode}
                        </span>
                      ) : null}
                    </td>

                    {/* Amount Column */}
                    <td className="py-3.5 px-3 font-black text-[#2D3436]">
                      {formatCurrency(inv.totalAmount || inv.amount)}
                    </td>

                    {/* Status Column */}
                    <td className="py-3.5 px-3">
                      {inv.status ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            inv.status === "Paid"
                              ? "bg-[#00B894]/10 text-[#00B894] border-[#00B894]/20"
                              : inv.status === "Approved"
                              ? "bg-[#0984E3]/10 text-[#0984E3] border-[#0984E3]/20"
                              : inv.status === "Pending"
                              ? "bg-[#E17055]/10 text-[#E17055] border-[#E17055]/20"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          • {inv.status}
                        </span>
                      ) : (
                        <span className="text-[#817B77] font-semibold">—</span>
                      )}
                    </td>

                    {/* Due Date Column */}
                    <td className="py-3.5 px-3 text-[#817B77] font-semibold">
                      {formatDate(inv.createdAt)}
                    </td>

                    {/* Paid On Column */}
                    <td className="py-3.5 px-3 text-[#817B77] font-semibold">
                      {inv.status === "Paid" ? formatDate(inv.paymentDate || inv.updatedAt) : "—"}
                    </td>

                    {/* Method Column */}
                    <td className="py-3.5 px-3 text-[#817B77] font-semibold">
                      {inv.paymentMethod || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls Footer */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#EBE6E3] text-xs text-[#817B77]">
            <span>
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, processedInvoices.length)} of{" "}
              {processedInvoices.length} payments
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#EBE6E3] bg-white text-[#2D3436] disabled:opacity-40 hover:bg-[#F4F0ED] cursor-pointer"
              >
                <FiChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === p
                      ? "bg-[#6C5CE7] text-white"
                      : "bg-white text-[#2D3436] border border-[#EBE6E3] hover:bg-[#F4F0ED]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-[#EBE6E3] bg-white text-[#2D3436] disabled:opacity-40 hover:bg-[#F4F0ED] cursor-pointer"
              >
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryTable;
