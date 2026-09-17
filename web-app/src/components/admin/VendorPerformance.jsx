import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const vendorData = [
  { name: "Apex Field Co.", score: 92, fill: "#C87A65" },
  { name: "SiteLine Pro", score: 87, fill: "#C87A65" },
  { name: "ClearVision", score: 82, fill: "#8A817C" },
  { name: "FieldEye Inc.", score: 76, fill: "#8A817C" },
  { name: "OpsLens", score: 72, fill: "#A39A94" },
  { name: "CamTrack", score: 68, fill: "#A39A94" },
];

const CustomVendorTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#3E3734] text-white text-[11px] rounded-lg py-1 px-2.5 shadow-lg border border-[#524B48] font-medium">
        <p className="font-bold">{data.name}</p>
        <p className="text-[#F4A261]">Quality Score: {data.score}%</p>
      </div>
    );
  }
  return null;
};

const VendorPerformance = () => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      {/* Header & Action */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold text-[#3E3734]">Vendor Performance</h2>
          <p className="text-xs text-[#817B77] mt-0.5">Quality scores by vendor</p>
        </div>

        <button className="bg-[#F2EBE5] hover:bg-[#EAE4DF] text-[#6E6763] hover:text-[#3E3734] px-3 py-1 rounded-full text-xs font-semibold transition-colors">
          View All
        </button>
      </div>

      {/* Recharts BarChart Container - Fills available flex height */}
      <div className="w-full flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={vendorData}
            margin={{ top: 5, right: 10, left: 15, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#F2EBE5"
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(val) => `${val}%`}
              tickLine={false}
              axisLine={{ stroke: "#F2EBE5" }}
              tick={{ fill: "#9E9792", fontSize: 10 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={95}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#4A423F", fontSize: 11, fontWeight: 500 }}
            />
            <Tooltip content={<CustomVendorTooltip />} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12}>
              {vendorData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VendorPerformance;
