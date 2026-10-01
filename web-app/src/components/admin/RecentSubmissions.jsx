import { Link } from "react-router-dom";
import { FiMapPin, FiCalendar, FiMoreHorizontal, FiFolder } from "react-icons/fi";

const getStatusStyle = (status) => {
  switch (status) {
    case "New":
      return "bg-[#FCECE7] text-[#C87A65]";
    case "Submitted":
    case "Under Review":
      return "bg-[#E3F2FD] text-[#1565C0]";
    case "Approved":
      return "bg-[#E8F5E9] text-[#2E7D32]";
    case "Rejected":
      return "bg-[#FFEBEE] text-[#C62828]";
    case "ASSIGNED":
    case "In Progress":
    default:
      return "bg-[#F4EFEA] text-[#6E6763]";
  }
};

const RecentSubmissions = ({ submissions = [], loading = false }) => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[#3E3734]">Recent Submissions</h2>
        <Link
          to="/admin/projects"
          className="bg-[#F2EBE5] hover:bg-[#EAE4DF] text-[#6E6763] hover:text-[#3E3734] px-3 py-1 rounded-full text-xs font-semibold transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Content area */}
      <div className="overflow-x-auto flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="py-8 text-center text-xs text-[#817B77]">
            Loading recent submissions...
          </div>
        ) : submissions.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#F2EBE5] text-[10px] font-bold tracking-wider text-[#A39A94] uppercase">
                <th className="pb-2.5 font-semibold">PROJECT</th>
                <th className="pb-2.5 font-semibold">LOCATION</th>
                <th className="pb-2.5 font-semibold">DATE</th>
                <th className="pb-2.5 font-semibold">STATUS</th>
                <th className="pb-2.5 w-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F4F2] text-xs">
              {submissions.map((row) => {
                const vendorName =
                  row.vendorId?.companyName ||
                  row.vendorId?.contactName ||
                  row.vendorName ||
                  "Unassigned";
                const dateStr = row.createdAt
                  ? new Date(row.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—";

                return (
                  <tr
                    key={row._id || row.id}
                    className="hover:bg-[#FAF7F5] transition-colors"
                  >
                    {/* Project */}
                    <td className="py-3">
                      <div className="font-semibold text-[#3E3734]">
                        {row.title || row.name || row.projectName || "Untitled Project"}
                      </div>
                      <div className="text-[10px] text-[#9E9792]">{vendorName}</div>
                    </td>

                    {/* Location */}
                    <td className="py-3 text-[#6E6763]">
                      <div className="flex items-center gap-1">
                        <FiMapPin className="text-[11px] text-[#A39A94]" />
                        <span className="text-[11px]">
                          {row.location || row.address || row.city || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 text-[#6E6763]">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="text-[11px] text-[#A39A94]" />
                        <span className="text-[11px]">{dateStr}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusStyle(
                          row.status
                        )}`}
                      >
                        {row.status || "New"}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/projects`}
                        className="text-[#A39A94] hover:text-[#3E3734] p-1 rounded-md hover:bg-[#EAE4DF]/50 transition-colors inline-block"
                      >
                        <FiMoreHorizontal className="text-base" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-1.5">
            <FiFolder className="text-xl text-[#A39A94]" />
            <p className="text-xs font-medium text-[#817B77]">
              No project submissions found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSubmissions;
