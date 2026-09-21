import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiFolder,
  FiPlusCircle,
  FiEdit,
  FiCheckCircle,
  FiUserPlus,
  FiFileText,
  FiGrid,
  FiLifeBuoy,
  FiClock,
} from "react-icons/fi";
import { getMyAuditLogs } from "../../services/auditService";

const getEventConfig = (action, entityType) => {
  if (action?.includes("CREATED")) {
    return {
      title: `${entityType} Created`,
      icon: FiPlusCircle,
      bg: "bg-[#E8F5E9]",
      color: "text-[#2E7D32]",
    };
  }
  if (action?.includes("STATUS")) {
    return {
      title: `${entityType} Status Changed`,
      icon: FiCheckCircle,
      bg: "bg-[#FFF8E1]",
      color: "text-[#F57F17]",
    };
  }
  if (action?.includes("UPDATED")) {
    return {
      title: `${entityType} Updated`,
      icon: FiEdit,
      bg: "bg-[#E3F2FD]",
      color: "text-[#1565C0]",
    };
  }

  // Fallback by entity type
  switch (entityType) {
    case "Vendor":
      return { title: "Vendor Activity", icon: FiUserPlus, bg: "bg-[#E3F2FD]", color: "text-[#1565C0]" };
    case "Invoice":
      return { title: "Invoice Activity", icon: FiFileText, bg: "bg-[#F3E5F5]", color: "text-[#7B1FA2]" };
    case "Service":
      return { title: "Service Activity", icon: FiGrid, bg: "bg-[#E0F2F1]", color: "text-[#00695C]" };
    case "Support":
      return { title: "Support Activity", icon: FiLifeBuoy, bg: "bg-[#FFEBEE]", color: "text-[#C62828]" };
    case "Project":
    default:
      return { title: "Project Activity", icon: FiFolder, bg: "bg-[#FCECE7]", color: "text-[#C87A65]" };
  }
};

const RecentActivity = ({ showSeeAll = true }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const res = await getMyAuditLogs({ limit: 5 });
        const list = res?.data || [];
        if (isMounted) {
          setActivities(list);
        }
      } catch (err) {
        console.error("Error fetching audit logs for recent activity:", err);
        if (isMounted) setActivities([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAuditLogs();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[#3E3734]">Recent Activity</h2>
        {showSeeAll && (
          <Link
            to="/admin/activity"
            className="text-xs font-semibold text-[#817B77] hover:text-[#3E3734] transition-colors"
          >
            See All
          </Link>
        )}
      </div>

      {/* Activity Items List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-[#817B77]">
          Loading activity log...
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((item) => {
            const { title, icon: Icon, bg, color } = getEventConfig(
              item.action,
              item.entityType
            );
            const dateStr = item.createdAt
              ? new Date(item.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              : "—";

            return (
              <div
                key={item._id}
                className="flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${bg} ${color} flex items-center justify-center shrink-0 mt-0.5 border border-black/5`}
                  >
                    <Icon className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#3E3734]">
                      {title}
                    </h3>
                    <p className="text-[11px] text-[#817B77] mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-[#A39A94] shrink-0 text-right">
                  {dateStr}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-1.5">
          <FiClock className="text-xl text-[#A39A94]" />
          <p className="text-xs font-medium text-[#817B77]">
            No recent activity recorded.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
