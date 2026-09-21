import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
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
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
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

const Activity = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const res = await getMyAuditLogs({ page, limit: 10 });
        const list = res?.data || [];
        const pag = res?.pagination || { page: 1, limit: 10, total: list.length, pages: 1 };
        if (isMounted) {
          setActivities(list);
          setPagination(pag);
        }
      } catch (err) {
        console.error("Error fetching audit logs for full activity page:", err);
        if (isMounted) {
          setActivities([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAuditLogs();
    return () => {
      isMounted = false;
    };
  }, [page]);

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      {/* Sidebar */}
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Area */}
      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Header */}
        <AdminHeader
          title="Activity"
          subtitle="View your recent account and system activity."
          showSearch={false}
        />

        {/* Main Body */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#817B77] hover:text-[#3E3734] transition-colors"
            >
              <FiArrowLeft className="text-sm" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Activity Log Card */}
          <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-4">
              <h2 className="text-sm font-bold text-[#3E3734]">All Activity</h2>
              {pagination.total > 0 && (
                <span className="text-xs text-[#817B77]">
                  Showing {activities.length} of {pagination.total} events
                </span>
              )}
            </div>

            {/* List */}
            {loading ? (
              <div className="py-12 text-center text-xs text-[#817B77]">
                Loading activity history...
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
                      className="p-4 bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F2EBE5]/50 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-full ${bg} ${color} flex items-center justify-center shrink-0 mt-0.5 border border-black/5`}
                        >
                          <Icon className="text-base" />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-bold text-[#3E3734]">
                            {title}
                          </h3>
                          <p className="text-xs text-[#6E6763]">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-medium text-[#A39A94] shrink-0 sm:text-right">
                        {dateStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <FiClock className="text-2xl text-[#A39A94]" />
                <p className="text-xs font-semibold text-[#817B77]">
                  No activity has been recorded yet.
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="pt-4 border-t border-[#F2EBE5] flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 bg-[#FAF7F5] border border-[#E8E2DE] text-[#3E3734] hover:bg-[#F2EBE5] disabled:opacity-50 disabled:cursor-not-allowed px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  <FiChevronLeft />
                  <span>Previous</span>
                </button>

                <span className="text-xs text-[#817B77] font-medium">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages}
                  className="flex items-center gap-1 bg-[#FAF7F5] border border-[#E8E2DE] text-[#3E3734] hover:bg-[#F2EBE5] disabled:opacity-50 disabled:cursor-not-allowed px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  <span>Next</span>
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Activity;
