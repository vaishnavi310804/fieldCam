import { FiEdit2, FiPower, FiMoreVertical, FiBriefcase, FiCheckCircle, FiAlertCircle, FiClock } from "react-icons/fi";

const formatActivityTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const CompaniesTable = ({
  companies = [],
  loading = false,
  onEditCompany = () => {},
  onToggleStatus = () => {},
}) => {
  return (
    <div className="bg-white border border-[#EBE6E3] rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#817B77]">
            Loading client organizations...
          </div>
        ) : !companies || companies.length === 0 ? (
          <div className="p-12 text-center text-[#817B77]">
            <FiBriefcase className="text-3xl mx-auto mb-2 text-[#A39A94]" />
            <p className="text-xs font-bold text-[#2D3436]">No companies match criteria.</p>
            <p className="text-[11px] text-[#A39A94] mt-0.5">
              Try adjusting your search terms or status filters.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F5] border-b border-[#EBE6E3] text-[10px] font-bold text-[#817B77] uppercase tracking-wider">
                <th className="py-3.5 px-6">Company</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Plan / Services</th>
                <th className="py-3.5 px-6">Users</th>
                <th className="py-3.5 px-6">Last Activity</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F2EBE5] text-xs">
              {companies.map((company) => {
                const isCompanyActive = company.status === "Active";
                const isSuspended = company.status === "Suspended";
                const companyInitials =
                  company.initials ||
                  (company.companyName
                    ? company.companyName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "CO");

                const planText =
                  Array.isArray(company.services) && company.services.length > 0
                    ? company.services.join(", ")
                    : "N/A";

                const associatedUsers =
                  typeof company.userCount === "number" && company.userCount > 0
                    ? company.userCount
                    : company.userId?.name
                    ? 1
                    : "N/A";

                const lastActivityText = formatActivityTime(
                  company.updatedAt || company.joinedDate || company.createdAt
                );

                return (
                  <tr
                    key={company._id || company.id}
                    className="hover:bg-[#FAF7F5] transition-colors"
                  >
                    {/* Company Identity */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                          style={{
                            backgroundColor: company.avatarBg || "#5141F5",
                          }}
                        >
                          {companyInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#2D3436] truncate">
                            {company.companyName}
                          </p>
                          <p className="text-[10px] text-[#817B77] truncate">
                            {company.contactName} • {company.location || "Global"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                          isCompanyActive
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : isSuspended
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : "bg-slate-50 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {isCompanyActive ? (
                          <FiCheckCircle className="text-[10px]" />
                        ) : (
                          <FiAlertCircle className="text-[10px]" />
                        )}
                        <span>{company.status}</span>
                      </span>
                    </td>

                    {/* Plan / Services */}
                    <td className="py-4 px-6 max-w-[200px]">
                      <p className="font-semibold text-[#2D3436] truncate">
                        {planText}
                      </p>
                      <p className="text-[10px] text-[#817B77] truncate">
                        {company.rating ? `Rating: ${company.rating}/5` : "Registered Vendor"}
                      </p>
                    </td>

                    {/* Users */}
                    <td className="py-4 px-6 font-medium text-[#2D3436]">
                      {associatedUsers}
                    </td>

                    {/* Last Activity */}
                    <td className="py-4 px-6 text-[#817B77]">
                      <div className="flex items-center gap-1 text-[11px]">
                        <FiClock className="text-xs text-[#A39A94]" />
                        <span>{lastActivityText}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditCompany(company)}
                          className="p-1.5 text-[#817B77] hover:text-[#5141F5] hover:bg-[#EEF0FF] rounded-lg transition cursor-pointer"
                          title="Edit Company"
                        >
                          <FiEdit2 className="text-sm" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onToggleStatus(
                              company,
                              isCompanyActive ? "Suspended" : "Active"
                            )
                          }
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isCompanyActive
                              ? "text-[#817B77] hover:text-[#DC2626] hover:bg-red-50"
                              : "text-[#817B77] hover:text-[#10B981] hover:bg-emerald-50"
                          }`}
                          title={isCompanyActive ? "Suspend Company" : "Activate Company"}
                        >
                          <FiPower className="text-sm" />
                        </button>

                        <button
                          type="button"
                          className="p-1.5 text-[#817B77] hover:text-[#2D3436] hover:bg-[#F5F2F0] rounded-lg transition cursor-pointer"
                          title="More Actions"
                        >
                          <FiMoreVertical className="text-sm" />
                        </button>
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

export default CompaniesTable;
