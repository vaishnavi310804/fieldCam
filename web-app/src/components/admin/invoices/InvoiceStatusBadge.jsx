const InvoiceStatusBadge = ({ status }) => {
  let badgeStyles;
  let dotStyle;

  switch (status) {
    case "Submitted":
    case "Pending":
      badgeStyles = "bg-[#FEF3C7] text-[#D97706]";
      dotStyle = "bg-[#D97706]";
      break;
    case "Approved":
      badgeStyles = "bg-[#E3F2FD] text-[#1565C0]";
      dotStyle = "bg-[#1565C0]";
      break;
    case "Sent":
      badgeStyles = "bg-[#F3E8FF] text-[#7E22CE]";
      dotStyle = "bg-[#7E22CE]";
      break;
    case "Paid":
      badgeStyles = "bg-[#E8F5E9] text-[#2E7D32]";
      dotStyle = "bg-[#2E7D32]";
      break;
    case "Rejected":
      badgeStyles = "bg-[#FFEBEE] text-[#C62828]";
      dotStyle = "bg-[#C62828]";
      break;
    case "Draft":
    default:
      badgeStyles = "bg-[#F4EFEA] text-[#817B77]";
      dotStyle = "bg-[#817B77]";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${badgeStyles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`}></span>
      {status || "Draft"}
    </span>
  );
};

export default InvoiceStatusBadge;
