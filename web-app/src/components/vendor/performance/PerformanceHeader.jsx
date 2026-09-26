import { FiCalendar, FiDownload } from "react-icons/fi";
import { FaRegChartBar } from "react-icons/fa";

const PerformanceHeader = ({ periodFilter, setPeriodFilter, onExport, hasData }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center shadow-xs shrink-0">
          <span className="font-black text-lg"><FaRegChartBar className="text-[#FFFFFF]"/></span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#2D3436] tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-xs text-[#817B77] font-medium">
            Track quality, speed, and team productivity.
          </p>
        </div>
      </div>

      {/* Top-Right Controls */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {/* Period Selector Dropdown */}
        <div className="flex items-center gap-2 bg-white border border-[#EBE6E3] rounded-xl px-3 py-2 text-xs font-bold text-[#2D3436] shadow-2xs">
          <FiCalendar className="text-[#817B77] text-sm" />
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="bg-transparent outline-none text-xs font-bold text-[#2D3436] cursor-pointer"
          >
            <option value="THIS_YEAR">This Year</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
            <option value="ALL_TIME">All Time</option>
          </select>
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={onExport}
          disabled={!hasData}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
            hasData
              ? "bg-[#6C5CE7] text-white hover:bg-[#5B4BC4]"
              : "bg-white text-[#A09893] border border-[#EBE6E3] cursor-not-allowed"
          }`}
        >
          <FiDownload className="text-sm" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};

export default PerformanceHeader;
