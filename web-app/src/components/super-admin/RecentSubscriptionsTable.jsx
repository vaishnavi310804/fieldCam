import { useState } from "react";
import {
  FiFilter,
  FiDownload,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
} from "react-icons/fi";

const RecentSubscriptionsTable = ({
  subscriptions = [],
  pagination = {},
  loading = false,
  onPageChange = () => {},
  onFilterChange = () => {},
  onStatusUpdate = () => {},
  plans = [],
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [activeMenuId, setActiveMenuId] = useState(null);

  const { currentPage = 1, totalPages = 1, totalRecords = 0, pageSize = 10 } = pagination;

  const handleStatusFilter = (val) => {
    setStatusFilter(val);
    onFilterChange({ status: val, planId: planFilter });
  };

  const handlePlanFilter = (val) => {
    setPlanFilter(val);
    onFilterChange({ status: statusFilter, planId: val });
  };

  const handleExportCsv = () => {
    if (!subscriptions.length) return;
    const headers = ["Company", "Plan", "Status", "Users", "Renewal Date"];
    const rows = subscriptions.map((s) => [
      `"${s.companyName}"`,
      `"${s.planName}"`,
      `"${s.status}"`,
      `"${s.userCount}/${s.userLimit === -1 ? "Unlimited" : s.userLimit}"`,
      `"${s.renewalDate ? new Date(s.renewalDate).toLocaleDateString() : "N/A"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscriptions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "Past Due":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Past Due
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
      case "Trial":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Trial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EBE6E3] shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-[#EBE6E3] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#2D3436]">
            Recent Subscribed Companies
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6E6763] hover:text-[#2D3436] bg-[#FAF7F5] hover:bg-[#F5F2F0] border border-[#EBE6E3] rounded-lg transition-colors cursor-pointer"
          >
            <FiDownload size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              showFilters
                ? "bg-[#817B77] text-white border-[#817B77]"
                : "bg-[#FAF7F5] hover:bg-[#F5F2F0] text-[#6E6763] hover:text-[#2D3436] border-[#EBE6E3]"
            }`}
          >
            <FiFilter size={14} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Expandable Filter Drawer */}
      {showFilters && (
        <div className="px-6 py-3 bg-[#FAF7F5] border-b border-[#EBE6E3] flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#6E6763]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="h-8 bg-white border border-[#EBE6E3] rounded-lg px-2.5 text-xs text-[#2D3436] outline-none focus:border-[#5141F5]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Past Due">Past Due</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Trial">Trial</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-[#6E6763]">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => handlePlanFilter(e.target.value)}
              className="h-8 bg-white border border-[#EBE6E3] rounded-lg px-2.5 text-xs text-[#2D3436] outline-none focus:border-[#5141F5]"
            >
              <option value="ALL">All Plans</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF7F5] border-b border-[#EBE6E3] text-[10px] font-bold text-[#817B77] uppercase tracking-wider">
              <th className="py-3 px-6">Company</th>
              <th className="py-3 px-6">Plan</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Users</th>
              <th className="py-3 px-6">Renewal Date</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE6E3] text-xs text-[#2D3436]">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-[#817B77]">
                  <div className="inline-block w-6 h-6 border-2 border-[#817B77] border-t-transparent rounded-full animate-spin mb-2" />
                  <p>Loading subscription records...</p>
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-[#817B77]">
                  <p className="font-semibold text-sm text-[#2D3436] mb-1">
                    No subscribed companies found
                  </p>
                  <p className="text-xs">
                    Try adjusting your search or filter parameters.
                  </p>
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr
                  key={sub._id}
                  className="hover:bg-[#FAF7F5]/60 transition-colors"
                >
                  {/* Company */}
                  <td className="py-3.5 px-6 font-medium">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: sub.avatarBg || "#5141F5" }}
                      >
                        {sub.initials}
                      </div>
                      <span className="font-bold text-[#2D3436]">
                        {sub.companyName}
                      </span>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="py-3.5 px-6">
                    <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#F5F2F0] text-[#6E6763]">
                      {sub.planCode || sub.planName}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-6">{getStatusBadge(sub.status)}</td>

                  {/* Users */}
                  <td className="py-3.5 px-6 font-semibold text-[#2D3436]">
                    {sub.userCount} /{" "}
                    {sub.userLimit === -1 ? "∞" : sub.userLimit}
                  </td>

                  {/* Renewal Date */}
                  <td className="py-3.5 px-6 text-[#6E6763]">
                    {sub.renewalDate
                      ? new Date(sub.renewalDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-6 text-right relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuId(
                          activeMenuId === sub._id ? null : sub._id
                        )
                      }
                      className="p-1.5 rounded-lg text-[#817B77] hover:text-[#2D3436] hover:bg-[#F5F2F0] transition-colors cursor-pointer"
                      title="Actions"
                    >
                      <FiMoreVertical size={16} />
                    </button>

                    {activeMenuId === sub._id && (
                      <div className="absolute right-6 top-10 z-20 w-40 bg-white rounded-xl shadow-lg border border-[#EBE6E3] py-1 text-left">
                        <p className="px-3 py-1 text-[10px] font-bold text-[#817B77] uppercase tracking-wider">
                          Update Status
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            onStatusUpdate(sub._id, "Active");
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-left text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                        >
                          Set Active
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onStatusUpdate(sub._id, "Past Due");
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-left text-amber-600 hover:bg-amber-50 cursor-pointer"
                        >
                          Set Past Due
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onStatusUpdate(sub._id, "Cancelled");
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-left text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          Set Cancelled
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-3 bg-[#FAF7F5] border-t border-[#EBE6E3] flex items-center justify-between text-xs text-[#817B77]">
        <div>
          Showing {startRecord}–{endRecord} of {totalRecords} companies
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-[#EBE6E3] text-[#6E6763] hover:text-[#2D3436] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Page"
          >
            <FiChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              type="button"
              onClick={() => onPageChange(pg)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                pg === currentPage
                  ? "bg-[#817B77] text-white shadow-xs"
                  : "bg-white text-[#6E6763] border border-[#EBE6E3] hover:bg-[#F5F2F0]"
              }`}
            >
              {pg}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-[#EBE6E3] text-[#6E6763] hover:text-[#2D3436] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Page"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentSubscriptionsTable;
