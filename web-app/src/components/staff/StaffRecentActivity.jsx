import { useState, useEffect } from "react";
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
  FiCamera,
  FiSend,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { getMyAuditLogs } from "../../services/auditService";

/**
 * Action & Entity type visual mapping matching FieldCam design system
 */
const getEventConfig = (action, entityType) => {
  const act = (action || "").toUpperCase();

  if (act.includes("PHOTO_UPLOADED") || act.includes("UPLOAD")) {
    return {
      title: "Photo Uploaded",
      icon: FiCamera,
      bg: "bg-[#E3F2FD]",
      color: "text-[#1565C0]",
    };
  }
  if (act.includes("PHOTO_DELETED")) {
    return {
      title: "Photo Removed",
      icon: FiEdit,
      bg: "bg-[#FFEBEE]",
      color: "text-[#C62828]",
    };
  }
  if (act.includes("SUBMITTED")) {
    return {
      title: "Project Submitted",
      icon: FiSend,
      bg: "bg-[#F3E5F5]",
      color: "text-[#7B1FA2]",
    };
  }
  if (act.includes("ASSIGNED")) {
    return {
      title: "Project Assigned",
      icon: FiUserPlus,
      bg: "bg-[#E8F5E9]",
      color: "text-[#2E7D32]",
    };
  }
  if (act.includes("CREATED")) {
    return {
      title: `${entityType || "Record"} Created`,
      icon: FiPlusCircle,
      bg: "bg-[#E8F5E9]",
      color: "text-[#2E7D32]",
    };
  }
  if (act.includes("STATUS")) {
    return {
      title: `${entityType || "Project"} Status Changed`,
      icon: FiCheckCircle,
      bg: "bg-[#FFF8E1]",
      color: "text-[#F57F17]",
    };
  }
  if (act.includes("UPDATED") || act.includes("NOTE")) {
    return {
      title: `${entityType || "Project"} Updated`,
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

const StaffRecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaffActivityLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch authenticated staff member's real audit logs
      const res = await getMyAuditLogs({ limit: 6 });
      const rawList = res?.data || res || [];
      const list = Array.isArray(rawList) ? rawList : [];

      // Sort newest first explicitly using createdAt timestamp
      const sortedList = [...list].sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setActivities(sortedList);
    } catch (err) {
      console.error("Error fetching staff audit logs:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load recent activity"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffActivityLogs();
  }, []);

  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col h-full justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#3E3734]">Recent Activity</h2>
            <p className="text-xs text-[#817B77] mt-0.5">
              Your recent operational history & actions
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <FiAlertCircle className="text-sm shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchStaffActivityLogs}
              className="flex items-center gap-1 bg-[#C62828] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-[#B71C1C] transition-colors cursor-pointer shrink-0"
            >
              <FiRefreshCw className="text-[10px]" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-8 text-center text-xs text-[#817B77] space-y-2">
            <FiClock className="animate-spin text-xl mx-auto text-[#8A817C]" />
            <p className="font-semibold">Loading recent activity log...</p>
          </div>
        )}

        {/* Activity List */}
        {!loading && !error && activities.length > 0 && (
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
                  key={item._id || item.id}
                  className="flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full ${bg} ${color} flex items-center justify-center shrink-0 mt-0.5 border border-black/5`}
                    >
                      <Icon className="text-sm" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#3E3734] truncate">
                        {title}
                      </h3>
                      {item.description && (
                        <p className="text-[11px] text-[#817B77] mt-0.5 line-clamp-2 leading-tight">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-[#A39A94] shrink-0 text-right">
                    {dateStr}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && activities.length === 0 && (
          <div className="bg-[#FAF7F5] border border-dashed border-[#E8E2DE] rounded-xl p-8 text-center text-xs text-[#817B77] space-y-1.5 my-2">
            <FiClock className="text-2xl mx-auto text-[#A39A94]" />
            <p className="font-bold text-[#3E3734]">No recent activity recorded.</p>
            <p className="text-[11px] text-[#817B77]">
              Actions taken on your assigned field projects will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffRecentActivity;
