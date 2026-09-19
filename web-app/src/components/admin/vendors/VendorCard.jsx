import {
  FiMapPin,
  FiCalendar,
  FiStar,
  FiTrendingUp,
  FiTrendingDown,
  FiEye,
  FiPlus,
  FiSlash,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import VendorStatusBadge from "./VendorStatusBadge";

const VendorCard = ({ vendor, readOnly = false, onStatusChange }) => {
  const company = vendor.companyName || vendor.company || "Unnamed Vendor";
  const contact = vendor.contactName || vendor.contact || "No Contact";
  const initials =
    vendor.initials ||
    company
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const joined = vendor.joinedDate
    ? new Date(vendor.joinedDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : vendor.joined || "N/A";

  const monthlyChange = vendor.monthlyChange || "+0%";
  const isPositiveChange = monthlyChange.startsWith("+");
  const servicesList = Array.isArray(vendor.services) ? vendor.services : [];

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      <div>
        {/* 1. Header Row: Avatar, Company, Contact, Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Initials Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
              style={{ backgroundColor: vendor.avatarBg || "#8A817C" }}
            >
              {initials}
            </div>

            {/* Company & Contact */}
            <div>
              <h3 className="text-sm font-bold text-[#3E3734] leading-tight">
                {company}
              </h3>
              <p className="text-xs text-[#817B77] mt-0.5">{contact}</p>
            </div>
          </div>

          {/* Status Badge */}
          <VendorStatusBadge status={vendor.status} />
        </div>

        {/* 2. Location & Joined Date */}
        <div className="flex items-center gap-4 text-xs text-[#817B77] mb-3">
          <div className="flex items-center gap-1">
            <FiMapPin className="text-[11px] text-[#A39A94]" />
            <span>{vendor.location || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <FiCalendar className="text-[11px] text-[#A39A94]" />
            <span>Joined {joined}</span>
          </div>
        </div>

        {/* 3. Metric Boxes (Completed, Approval, Active) */}
        <div className="grid grid-cols-3 gap-2 my-3 bg-[#FAF7F5] rounded-xl p-3 text-center border border-[#F2EBE5]">
          <div>
            <span className="block text-sm font-bold text-[#3E3734]">
              {vendor.completed !== undefined ? vendor.completed : 0}
            </span>
            <span className="block text-[9px] font-bold text-[#A39A94] tracking-wider mt-0.5 uppercase">
              COMPLETED
            </span>
          </div>
          <div>
            <span className="block text-sm font-bold text-[#3E3734]">
              {vendor.approval || "N/A"}
            </span>
            <span className="block text-[9px] font-bold text-[#A39A94] tracking-wider mt-0.5 uppercase">
              APPROVAL
            </span>
          </div>
          <div>
            <span className="block text-sm font-bold text-[#3E3734]">
              {vendor.activeProjects !== undefined ? vendor.activeProjects : 0}
            </span>
            <span className="block text-[9px] font-bold text-[#A39A94] tracking-wider mt-0.5 uppercase">
              ACTIVE
            </span>
          </div>
        </div>

        {/* 4. Rating & Monthly Performance Indicator */}
        <div className="flex items-center justify-between my-2 text-xs">
          <div className="flex items-center gap-1">
            <FiStar className="text-amber-500 fill-amber-500 text-xs" />
            <span className="font-bold text-[#3E3734]">{vendor.rating ?? 4.0}</span>
          </div>

          <div
            className={`flex items-center gap-1 font-semibold text-[11px] ${
              isPositiveChange ? "text-[#2E7D32]" : "text-[#C62828]"
            }`}
          >
            {isPositiveChange ? (
              <FiTrendingUp className="text-xs" />
            ) : (
              <FiTrendingDown className="text-xs" />
            )}
            <span>{monthlyChange} this month</span>
          </div>
        </div>

        {/* 5. Service Tags */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {servicesList.length > 0 ? (
            servicesList.map((service, idx) => (
              <span
                key={idx}
                className="bg-[#F2EBE5] text-[#6E6763] px-2.5 py-1 rounded-md text-[11px] font-medium"
              >
                {service}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-[#A39A94] italic">No services listed</span>
          )}
        </div>
      </div>

      {/* 6. Action Buttons Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#F2EBE5] mt-2">
        <button className="flex-1 py-2 px-3 rounded-xl border border-[#E8E2DE] text-[#3E3734] hover:bg-[#F2EBE5] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
          <FiEye className="text-xs text-[#817B77]" />
          <span>View Profile</span>
        </button>

        {!readOnly && (
          <button className="flex-1 py-2 px-3 rounded-xl bg-[#8A817C] hover:bg-[#6E6763] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm">
            <FiPlus className="text-xs" />
            <span>Assign Project</span>
          </button>
        )}

        {!readOnly && onStatusChange && (
          <button
            onClick={() => {
              const nextStatus =
                vendor.status === "Active"
                  ? "Suspended"
                  : vendor.status === "Suspended"
                  ? "Inactive"
                  : "Active";
              onStatusChange(vendor._id, nextStatus);
            }}
            className="p-2.5 text-[#A39A94] hover:text-[#3E3734] hover:bg-[#F2EBE5] rounded-xl border border-[#E8E2DE] transition-colors"
            title={`Toggle status (Current: ${vendor.status})`}
            aria-label="Toggle vendor status"
          >
            {vendor.status === "Active" ? (
              <FiSlash className="text-xs text-amber-600" />
            ) : vendor.status === "Suspended" ? (
              <FiAlertTriangle className="text-xs text-red-600" />
            ) : (
              <FiCheckCircle className="text-xs text-emerald-600" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default VendorCard;
