import { FiMapPin, FiCalendar, FiMoreHorizontal } from "react-icons/fi";

const submissions = [
  {
    id: 1,
    project: "Downtown Plaza",
    code: "Apex Co.",
    location: "Portland, OR",
    date: "Mar 12",
    status: "New",
    statusBg: "bg-[#FCECE7] text-[#C87A65]",
  },
  {
    id: 2,
    project: "Harbor Site",
    code: "SiteLine",
    location: "Seattle, WA",
    date: "Mar 11",
    status: "In Review",
    statusBg: "bg-[#E3F2FD] text-[#1565C0]",
  },
  {
    id: 3,
    project: "Riverside",
    code: "ClearVision",
    location: "Denver, CO",
    date: "Mar 10",
    status: "Approved",
    statusBg: "bg-[#E8F5E9] text-[#2E7D32]",
  },
  {
    id: 4,
    project: "Tech Field",
    code: "FieldEye",
    location: "Austin, TX",
    date: "Mar 10",
    status: "In Progress",
    statusBg: "bg-[#F4EFEA] text-[#6E6763]",
  },
  {
    id: 5,
    project: "South Ops",
    code: "OpsLens",
    location: "Phoenix, AZ",
    date: "Mar 9",
    status: "New",
    statusBg: "bg-[#FCECE7] text-[#C87A65]",
  },
];

const RecentSubmissions = () => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[#3E3734]">Recent Submissions</h2>
        <button className="bg-[#F2EBE5] hover:bg-[#EAE4DF] text-[#6E6763] hover:text-[#3E3734] px-3 py-1 rounded-full text-xs font-semibold transition-colors">
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
            {submissions.map((row) => (
              <tr key={row.id} className="hover:bg-[#FAF7F5] transition-colors">
                {/* Project */}
                <td className="py-3">
                  <div className="font-semibold text-[#3E3734]">
                    {row.project}
                  </div>
                  <div className="text-[10px] text-[#9E9792]">{row.code}</div>
                </td>

                {/* Location */}
                <td className="py-3 text-[#6E6763]">
                  <div className="flex items-center gap-1">
                    <FiMapPin className="text-[11px] text-[#A39A94]" />
                    <span className="text-[11px]">{row.location}</span>
                  </div>
                </td>

                {/* Date */}
                <td className="py-3 text-[#6E6763]">
                  <div className="flex items-center gap-1">
                    <FiCalendar className="text-[11px] text-[#A39A94]" />
                    <span className="text-[11px]">{row.date}</span>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${row.statusBg}`}
                  >
                    {row.status}
                  </span>
                </td>

                {/* Actions Menu */}
                <td className="py-3 text-right">
                  <button className="text-[#A39A94] hover:text-[#3E3734] p-1 rounded-md hover:bg-[#EAE4DF]/50 transition-colors">
                    <FiMoreHorizontal className="text-base" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentSubmissions;
