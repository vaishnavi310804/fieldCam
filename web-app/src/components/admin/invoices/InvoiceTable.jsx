import { FiMoreHorizontal } from "react-icons/fi";
import InvoiceStatusBadge from "./InvoiceStatusBadge";

const InvoiceTable = ({ invoices }) => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F2EBE5] bg-[#FAF7F5] text-[10px] font-bold tracking-wider text-[#A39A94] uppercase">
              <th className="py-3.5 px-6 font-semibold">INVOICE ID</th>
              <th className="py-3.5 px-6 font-semibold">VENDOR</th>
              <th className="py-3.5 px-6 font-semibold">PROJECT</th>
              <th className="py-3.5 px-6 font-semibold">AMOUNT</th>
              <th className="py-3.5 px-6 font-semibold">TAX</th>
              <th className="py-3.5 px-6 font-semibold">STATUS</th>
              <th className="py-3.5 px-6 font-semibold">PAYMENT DATE</th>
              <th className="py-3.5 px-6 w-12 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F4F2] text-xs">
            {invoices.length > 0 ? (
              invoices.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#FAF7F5] transition-colors"
                >
                  {/* Invoice ID */}
                  <td className="py-3.5 px-6 font-bold text-[#3E3734]">
                    {row.id}
                  </td>

                  {/* Vendor */}
                  <td className="py-3.5 px-6 font-semibold text-[#4A423F]">
                    {row.vendor}
                  </td>

                  {/* Project & Project ID Stacked */}
                  <td className="py-3.5 px-6">
                    <div className="font-semibold text-[#3E3734]">
                      {row.project}
                    </div>
                    <div className="text-[10px] font-medium text-[#9E9792] mt-0.5">
                      {row.projectId}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-6 font-bold text-[#3E3734]">
                    {row.amount}
                  </td>

                  {/* Tax */}
                  <td className="py-3.5 px-6 text-[#6E6763] font-medium">
                    {row.tax}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-6">
                    <InvoiceStatusBadge status={row.status} />
                  </td>

                  {/* Payment Date */}
                  <td className="py-3.5 px-6 text-[#6E6763] font-medium">
                    {row.paymentDate}
                  </td>

                  {/* Actions Menu */}
                  <td className="py-3.5 px-6 text-right">
                    <button className="text-[#A39A94] hover:text-[#3E3734] p-1.5 rounded-lg hover:bg-[#EAE4DF]/60 transition-colors">
                      <FiMoreHorizontal className="text-base" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 px-6 text-center text-[#817B77]"
                >
                  <p className="text-sm font-semibold">No invoices found</p>
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

export default InvoiceTable;
