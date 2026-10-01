import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiBell,
  FiCheckCircle,
  FiFileText,
  FiHelpCircle,
  FiInfo,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiCheckSquare,
} from "react-icons/fi";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 30) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getNotificationTypeConfig = (type) => {
  switch (type) {
    case "PROJECT_UPDATED":
      return {
        Icon: FiCheckCircle,
        badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
        iconClass: "text-blue-600 bg-blue-50 border-blue-100",
        label: "Project",
      };
    case "INVOICE_UPDATED":
      return {
        Icon: FiFileText,
        badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
        iconClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
        label: "Invoice",
      };
    case "SUPPORT_TICKET_UPDATED":
      return {
        Icon: FiHelpCircle,
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
        iconClass: "text-amber-600 bg-amber-50 border-amber-100",
        label: "Support",
      };
    case "SYSTEM":
    default:
      return {
        Icon: FiInfo,
        badgeClass: "bg-[#FDF2F0] text-[#E07A5F] border-[#F5D8CE]",
        iconClass: "text-[#E07A5F] bg-[#FDF2F0] border-[#F5D8CE]",
        label: "System",
      };
  }
};

const NotificationPopover = ({
  buttonClassName = "relative p-2 rounded-full bg-white border border-[#EAE4DF] text-[#6E6763] hover:text-[#3E3734] hover:bg-[#F2EBE5] transition-colors cursor-pointer",
  iconClassName = "text-base",
  align = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const popoverRef = useRef(null);

  // Fetch initial unread count on mount
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadNotificationCount();
      if (res?.success && res?.data) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch unread notification count:", err);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Fetch full notification list
  const fetchNotificationsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNotifications();
      if (res?.success && Array.isArray(res?.data)) {
        setNotifications(res.data);
      } else {
        setNotifications([]);
      }
      // Also refresh unread count
      await fetchUnreadCount();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [fetchUnreadCount]);

  // Toggle popover visibility
  const handleTogglePopover = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchNotificationsList();
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Mark single item read
  const handleMarkAsRead = async (notificationId, e) => {
    if (e) e.stopPropagation();
    try {
      // Optimistic state update
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await markNotificationAsRead(notificationId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      // Rollback on error by refetching
      fetchNotificationsList();
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      // Optimistic state update
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);

      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      fetchNotificationsList();
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleTogglePopover}
        className={buttonClassName}
        aria-label="Notifications"
        title="Notifications"
      >
        <FiBell className={iconClassName} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#E07A5F] rounded-full border-2 border-white shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-80 sm:w-96 bg-white border border-[#E8E2DE] rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[80vh]`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#F7F4F2] border-b border-[#E8E2DE] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#3E3734]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold bg-[#E07A5F]/15 text-[#E07A5F] px-2 py-0.5 rounded-full border border-[#E07A5F]/20">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="text-[11px] font-medium text-[#E07A5F] hover:text-[#C65B40] hover:bg-[#F2EBE5] px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Mark all notifications as read"
                >
                  <FiCheckSquare className="text-xs" />
                  <span>{markingAll ? "Marking..." : "Mark all read"}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#817B77] hover:text-[#3E3734] hover:bg-[#EAE4DF] rounded-lg transition-colors cursor-pointer"
                aria-label="Close notifications"
              >
                <FiX className="text-xs" />
              </button>
            </div>
          </div>

          {/* Body List Container */}
          <div className="overflow-y-auto flex-1 divide-y divide-[#F2EBE5]">
            {loading ? (
              <div className="p-8 text-center text-[#817B77]">
                <FiRefreshCw className="animate-spin text-lg mx-auto mb-2 text-[#E07A5F]" />
                <p className="text-xs">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-xs text-red-600 mb-3">{error}</p>
                <button
                  type="button"
                  onClick={fetchNotificationsList}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E07A5F] text-white text-xs font-semibold rounded-xl hover:bg-[#C65B40] transition-colors cursor-pointer"
                >
                  <FiRefreshCw className="text-xs" />
                  <span>Retry</span>
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-[#817B77]">
                <div className="w-10 h-10 rounded-full bg-[#F7F4F2] border border-[#E8E2DE] flex items-center justify-center mx-auto mb-2">
                  <FiBell className="text-sm text-[#A39A94]" />
                </div>
                <p className="text-xs font-medium text-[#3E3734]">No notifications</p>
                <p className="text-[11px] text-[#A39A94] mt-0.5">
                  You're all caught up! Check back later for updates.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const typeConfig = getNotificationTypeConfig(item.type);
                const TypeIcon = typeConfig.Icon;

                return (
                  <div
                    key={item._id}
                    onClick={(e) => {
                      if (!item.isRead) {
                        handleMarkAsRead(item._id, e);
                      }
                    }}
                    className={`p-3.5 flex items-start gap-3 transition-colors ${
                      item.isRead
                        ? "bg-white hover:bg-[#FAF7F5]"
                        : "bg-[#FAF5F2] hover:bg-[#F5EFEA] cursor-pointer"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${typeConfig.iconClass}`}
                    >
                      <TypeIcon className="text-sm" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${typeConfig.badgeClass}`}
                          >
                            {typeConfig.label}
                          </span>
                          <h4
                            className={`text-xs truncate ${
                              item.isRead ? "font-medium text-[#3E3734]" : "font-bold text-[#2B2523]"
                            }`}
                          >
                            {item.title}
                          </h4>
                        </div>

                        <span className="text-[10px] text-[#817B77] shrink-0">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      <p
                        className={`text-xs line-clamp-2 ${
                          item.isRead ? "text-[#817B77]" : "text-[#4A423F]"
                        }`}
                      >
                        {item.body}
                      </p>
                    </div>

                    {/* Read Action / Status Indicator */}
                    <div className="shrink-0 self-center">
                      {!item.isRead ? (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(item._id, e)}
                          className="w-2.5 h-2.5 rounded-full bg-[#E07A5F] hover:scale-125 transition-transform"
                          title="Mark as read"
                          aria-label="Mark as read"
                        />
                      ) : (
                        <FiCheck className="text-xs text-[#A39A94]" title="Read" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-[#F7F4F2] border-t border-[#E8E2DE] text-center">
              <span className="text-[11px] text-[#817B77]">
                Showing {notifications.length} notification{notifications.length === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPopover;
