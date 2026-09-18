import { FiChevronDown } from "react-icons/fi";
import TicketPriorityBadge from "./TicketPriorityBadge";
import TicketStatusBadge from "./TicketStatusBadge";

const SupportTable = ({ tickets }) => {
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
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F4F2] text-xs">
            {tickets.length > 0 ? (
              tickets.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#FAF7F5] transition-colors"
                >
                  {/* Ticket ID */}
                  <td className="py-4 px-6 font-bold text-[#3E3734]">
                    {row.id}
                  </td>

                  {/* Vendor with initials avatar */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: row.avatarBg || "#8A817C" }}
                      >
                        {row.initials}
                      </div>
                      <span className="font-semibold text-[#3E3734]">
                        {row.vendor}
                      </span>
                    </div>
                  </td>

                  {/* Subject & Last Update */}
                  <td className="py-4 px-6 max-w-md">
                    <div className="font-semibold text-[#3E3734]">
                      {row.subject}
                    </div>
                    <div className="text-[11px] text-[#9E9792] mt-0.5">
                      Last update: {row.lastUpdate}
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
                    {row.created}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
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
    </div>
  );
};

export default SupportTable;
