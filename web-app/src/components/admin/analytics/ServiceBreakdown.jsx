import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const serviceData = [
  { name: "Site Inspection", value: 38, color: "#C87A65" },
  { name: "Property Survey", value: 22, color: "#5B67CA" },
  { name: "Progress Docs", value: 20, color: "#8A817C" },
  { name: "Aerial Mapping", value: 12, color: "#7C3AED" },
  { name: "Final Inspection", value: 8, color: "#10B981" },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#3E3734] text-white text-[11px] rounded-lg py-1 px-2.5 shadow-lg border border-[#524B48] font-medium">
        <p className="font-bold">{data.name}</p>
        <p style={{ color: data.color }}>Share: {data.value}%</p>
      </div>
    );
  }
  return null;
};

const ServiceBreakdown = () => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="mb-2">
          <h2 className="text-sm font-bold text-[#3E3734]">
            Service Breakdown
          </h2>
          <p className="text-xs text-[#817B77] mt-0.5">Projects by service type</p>
        </div>

        {/* Recharts Donut Chart */}
        <div className="w-full h-[160px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={serviceData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {serviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend / List below Donut */}
      <div className="space-y-1.5 pt-2 border-t border-[#F2EBE5] mt-2">
        {serviceData.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs font-medium text-[#6E6763]"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="truncate">{item.name}</span>
            </div>
            <span className="font-bold text-[#3E3734] shrink-0 ml-2">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceBreakdown;
