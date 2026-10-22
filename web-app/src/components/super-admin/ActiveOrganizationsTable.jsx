import { useState } from "react";
import { FiDownload, FiBriefcase, FiCheckCircle, FiAlertCircle, FiEye } from "react-icons/fi";
import VendorProfileModal from "../admin/vendors/VendorProfileModal";

const formatStorageDisplay = (storage, storageLimitGb) => {
  if (typeof storage === "string" && storage.trim()) {
    return storage;
  }
  if (typeof storageLimitGb === "number") {
    if (storageLimitGb === -1) return "Unlimited";
    if (storageLimitGb >= 0) return `${storageLimitGb} GB`;
    return "—";
  }
  if (typeof storage === "object" && storage !== null) {
    if (typeof storage.limitGb === "number") {
      if (storage.limitGb === -1) return "Unlimited";
      if (storage.limitGb >= 0) return `${storage.limitGb} GB`;
    }
    if (storage.text) return storage.text;
  }
  return "—";
};

const ActiveOrganizationsTable = ({
  organizations = [],
  loading = false,
}) => {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleOpenDetails = (org) => {
    setSelectedVendor({
      _id: org._id || org.id,
      companyName: org.name,
      contactName: org.contactName,
      status: org.status,
    });
    setIsDetailsModalOpen(true);
  };

  const handleExportCSV = () => {
    if (!organizations || organizations.length === 0) return;

    const headers = ["Organization,Status,Projects Assigned,Storage\n"];
    const rows = organizations.map(
      (org) =>
        `"${org.name}","${org.status}","${org.projectsAssigned ?? 0}","${formatStorageDisplay(
          org.storage,
          org.storageLimitGb
        )}"\n`
    );

    const blob = new Blob([...headers, ...rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `top_active_organizations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="p-6 border-b border-[#EBE6E3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#2D3436]">
            Top Active Organizations
          </h2>
          <p className="text-xs text-[#817B77] mt-0.5">
            Registered organization partners and operational activity status
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={loading || organizations.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F7FF] hover:bg-[#F2EBE5] text-[#2D3436] text-xs font-semibold rounded-lg border border-[#E5E7EB] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <FiDownload className="text-xs" />
          <span>EXPORT CSV</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#817B77]">
            Loading top active organizations...
          </div>
        ) : !organizations || organizations.length === 0 ? (
          <div className="p-12 text-center text-[#817B77]">
            <FiBriefcase className="text-2xl mx-auto mb-2 text-[#A39A94]" />
            <p className="text-xs font-bold text-[#2D3436]">No organizations registered yet.</p>
            <p className="text-[11px] text-[#A39A94] mt-0.5">
              Active vendor companies and organization accounts will appear here.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F5] border-b border-[#EBE6E3] text-[10px] font-bold text-[#817B77] uppercase tracking-wider">
                <th className="py-3 px-6">Organization</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Projects Assigned</th>
                <th className="py-3 px-6">Storage</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F2EBE5] text-xs">
              {organizations.map((org) => {
                const isActive = org.status === "ACTIVE";
                const isOverLimit = org.status === "OVER LIMIT" || org.status === "SUSPENDED";

                return (
                  <tr
                    key={org.id || org._id || org.name}
                    className="hover:bg-[#FAF7F5] transition-colors"
                  >
                    {/* Organization Name & Plan */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#F5F2F0] border border-[#EBE6E3] flex items-center justify-center shrink-0 text-[#817B77] font-bold text-xs">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#2D3436] truncate">
                            {org.name}
                          </p>
                          <p className="text-[10px] text-[#817B77] truncate">
                            {org.planName || org.plan || "Standard Plan"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                          isActive
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : isOverLimit
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : "bg-slate-50 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {isActive ? (
                          <FiCheckCircle className="text-[10px]" />
                        ) : (
                          <FiAlertCircle className="text-[10px]" />
                        )}
                        <span>{org.status}</span>
                      </span>
                    </td>

                    {/* Projects Assigned (Authoritative project count) */}
                    <td className="py-4 px-6 font-semibold text-[#2D3436]">
                      {typeof org.projectsAssigned === "number" ? org.projectsAssigned : "—"}
                    </td>

                    {/* Storage (Plan Limit Only) */}
                    <td className="py-4 px-6 text-[#2D3436]">
                      <span className="font-semibold text-xs">
                        {formatStorageDisplay(org.storage, org.storageLimitGb)}
                      </span>
                    </td>

                    {/* View Details Action Button */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(org)}
                        className="items-center justify-center p-1.5 hover:bg-[#FAF7F5] text-[#2D3436] hover:text-[#000] text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        <FiEye className="text-sm" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Existing Vendor / Organization Profile Detail Modal */}
      {isDetailsModalOpen && selectedVendor && (
        <VendorProfileModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedVendor(null);
          }}
          vendor={selectedVendor}
        />
      )}
    </div>
  );
};

export default ActiveOrganizationsTable;
