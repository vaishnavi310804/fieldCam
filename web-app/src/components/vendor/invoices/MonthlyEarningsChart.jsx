import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const defaultFormatCurrency = (val) => {
  const num = Number(val || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const MonthlyEarningsChart = ({ data = [], formatCurrency = defaultFormatCurrency }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#EBE6E3] p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[#2D3436]">Monthly Earnings</h3>
          <p className="text-xs text-[#817B77] font-medium">Earned vs paid breakdown</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-[#817B77]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6C5CE7]" />
            Earned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00B894]" />
            Paid
          </span>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00B894" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00B894" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#817B77", fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v / 1000}k`}
              tick={{ fill: "#817B77", fontSize: 10, fontWeight: 600 }}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), "Earnings"]}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                borderColor: "#EBE6E3",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#00B894"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorArea)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyEarningsChart;
