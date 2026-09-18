import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const paymentOverviewData = [
  { month: "Sep", paid: 12400, pending: 3200 },
  { month: "Oct", paid: 15800, pending: 4100 },
  { month: "Nov", paid: 14200, pending: 5800 },
  { month: "Dec", paid: 18500, pending: 3900 },
  { month: "Jan", paid: 16900, pending: 6200 },
  { month: "Feb", paid: 19400, pending: 4800 },
  { month: "Mar", paid: 11718, pending: 14310 },
];

const CustomPaymentTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#3E3734] text-white text-[11px] rounded-lg py-1.5 px-3 shadow-lg font-medium border border-[#524B48]">
        <p className="font-bold border-b border-gray-600 pb-1 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PaymentOverview = () => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#3E3734]">Payment Overview</h2>
          <p className="text-xs text-[#817B77] mt-0.5">
            Monthly paid vs pending invoices
          </p>
        </div>

        {/* Legend dots */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C87A65]"></span>
            <span className="text-[#6E6763] font-medium">Paid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D5C9C2]"></span>
            <span className="text-[#6E6763] font-medium">Pending</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={paymentOverviewData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F2EBE5"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9E9792", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val / 1000}k`}
              tick={{ fill: "#9E9792", fontSize: 10 }}
            />
            <Tooltip content={<CustomPaymentTooltip />} />
            <Bar
              dataKey="paid"
              name="Paid"
              fill="#C87A65"
              radius={[4, 4, 0, 0]}
              barSize={14}
            />
            <Bar
              dataKey="pending"
              name="Pending"
              fill="#D5C9C2"
              radius={[4, 4, 0, 0]}
              barSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PaymentOverview;
