import {
  FiUpload,
  FiCheck,
  FiMessageSquare,
  FiAlertCircle,
  FiUserPlus,
  FiClock,
} from "react-icons/fi";

const activities = [
  {
    id: 1,
    title: "New site photos uploaded",
    subtitle: "Project #2847 — Downtown Plaza",
    time: "2 min ago",
    icon: FiUpload,
    bg: "bg-[#FCECE7]",
    color: "text-[#C87A65]",
  },
  {
    id: 2,
    title: "Inspection approved",
    subtitle: "Project #2831 — Harbor Bridge",
    time: "18 min ago",
    icon: FiCheck,
    bg: "bg-[#E8F5E9]",
    color: "text-[#2E7D32]",
  },
  {
    id: 3,
    title: "Comment from reviewer",
    subtitle: '"Needs additional angles on east wall"',
    time: "45 min ago",
    icon: FiMessageSquare,
    bg: "bg-[#F4EFEA]",
    color: "text-[#6E6763]",
  },
  {
    id: 4,
    title: "Deadline approaching",
    subtitle: "Project #2839 — Riverside Park",
    time: "1 hr ago",
    icon: FiAlertCircle,
    bg: "bg-[#FFEBEE]",
    color: "text-[#C62828]",
  },
  {
    id: 5,
    title: "New vendor onboarded",
    subtitle: "ClearVision Studios joined",
    time: "2 hrs ago",
    icon: FiUserPlus,
    bg: "bg-[#E3F2FD]",
    color: "text-[#1565C0]",
  },
  {
    id: 6,
    title: "Review period started",
    subtitle: "Project #2844 — Tech Campus",
    time: "3 hrs ago",
    icon: FiClock,
    bg: "bg-[#F5F5F5]",
    color: "text-[#757575]",
  },
];

const RecentActivity = () => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-[#3E3734]">Recent Activity</h2>
        <button className="bg-[#F2EBE5] hover:bg-[#EAE4DF] text-[#6E6763] hover:text-[#3E3734] px-3 py-1 rounded-full text-xs font-semibold transition-colors">
          View All
        </button>
      </div>

      {/* Activity Items List */}
      <div className="space-y-4">
        {activities.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.id} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {/* Icon Container */}
                <div
                  className={`w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0 mt-0.5 border border-black/5`}
                >
                  <Icon className="text-sm" />
                </div>

                {/* Details */}
                <div>
                  <h3 className="text-xs font-semibold text-[#3E3734]">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#817B77] mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Timestamp */}
              <span className="text-[10px] font-medium text-[#A39A94] shrink-0">
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
