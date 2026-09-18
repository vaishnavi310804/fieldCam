import { FiAlertTriangle, FiAlertCircle, FiInfo, FiClock } from "react-icons/fi";

const TicketPriorityBadge = ({ priority }) => {
  let badgeStyles = "bg-[#F4EFEA] text-[#6E6763]";
  let Icon = FiClock;

  if (priority === "Urgent") {
    badgeStyles = "bg-[#FFEBEE] text-[#C62828]";
    Icon = FiAlertTriangle;
  } else if (priority === "High") {
    badgeStyles = "bg-[#FEF3C7] text-[#D97706]";
    Icon = FiAlertTriangle;
  } else if (priority === "Medium") {
    badgeStyles = "bg-[#E3F2FD] text-[#1565C0]";
    Icon = FiInfo;
  } else if (priority === "Low") {
    badgeStyles = "bg-[#F4EFEA] text-[#6E6763]";
    Icon = FiAlertCircle;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badgeStyles}`}
    >
      <Icon className="text-[11px]" />
      <span>{priority}</span>
    </span>
  );
};

export default TicketPriorityBadge;
