const statusStyles = {
  New: {
    bg: "bg-[#E3F2FD]",
    text: "text-[#1565C0]",
    dot: "bg-[#1565C0]",
  },
  "In Progress": {
    bg: "bg-[#FFF3E0]",
    text: "text-[#E65100]",
    dot: "bg-[#E65100]",
  },
  Submitted: {
    bg: "bg-[#F3E5F5]",
    text: "text-[#7B1FA2]",
    dot: "bg-[#7B1FA2]",
  },
  Approved: {
    bg: "bg-[#E8F5E9]",
    text: "text-[#2E7D32]",
    dot: "bg-[#2E7D32]",
  },
  Rejected: {
    bg: "bg-[#FFEBEE]",
    text: "text-[#C62828]",
    dot: "bg-[#C62828]",
  },
};

const ProjectStatusBadge = ({ status }) => {
  const style = statusStyles[status] || {
    bg: "bg-[#F4EFEA]",
    text: "text-[#6E6763]",
    dot: "bg-[#6E6763]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      <span>{status}</span>
    </span>
  );
};

export default ProjectStatusBadge;
