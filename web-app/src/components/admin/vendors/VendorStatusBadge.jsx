const VendorStatusBadge = ({ status }) => {
  let badgeStyle = "bg-[#E8F5E9] text-[#2E7D32]"; // Default Active

  if (status === "Suspended") {
    badgeStyle = "bg-[#FFF3E0] text-[#E65100]";
  } else if (status === "Inactive") {
    badgeStyle = "bg-[#FFEBEE] text-[#C62828]";
  }

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badgeStyle}`}
    >
      {status || "Active"}
    </span>
  );
};

export default VendorStatusBadge;
