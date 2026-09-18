const InvoiceStatusBadge = ({ status }) => {
  let badgeStyles = "bg-[#F4EFEA] text-[#6E6763]";
  let dotStyle = "bg-[#6E6763]";

  if (status === "Pending") {
    badgeStyles = "bg-[#FEF3C7] text-[#D97706]";
    dotStyle = "bg-[#D97706]";
  } else if (status === "Approved") {
    badgeStyles = "bg-[#E3F2FD] text-[#1565C0]";
    dotStyle = "bg-[#1565C0]";
  } else if (status === "Paid") {
    badgeStyles = "bg-[#E8F5E9] text-[#2E7D32]";
    dotStyle = "bg-[#2E7D32]";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badgeStyles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`}></span>
      {status}
    </span>
  );
};

export default InvoiceStatusBadge;
