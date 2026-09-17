const VendorStatusBadge = ({ status }) => {
  const isSuspended = status === "Suspended";

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
        isSuspended
          ? "bg-[#FFEBEE] text-[#C62828]"
          : "bg-[#E8F5E9] text-[#2E7D32]"
      }`}
    >
      {status}
    </span>
  );
};

export default VendorStatusBadge;
