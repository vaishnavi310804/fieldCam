import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import RecentActivity from "../../components/admin/RecentActivity";
import EditProfileModal from "../../components/admin/EditProfileModal";
import { getProjects } from "../../services/projectService";
import { getVendors } from "../../services/vendorService";
import { getProfile } from "../../services/authService";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiGlobe,
  FiClock,
  FiKey,
  FiShield,
  FiLock,
  FiBell,
  FiEdit2,
} from "react-icons/fi";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Personal Info");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch fresh user profile on mount
  useEffect(() => {
    let isMounted = true;
    const fetchFreshProfile = async () => {
      try {
        const res = await getProfile();
        if (isMounted && res?.success && res?.data) {
          updateUser(res.data);
        }
      } catch (err) {
        console.error("Error fetching fresh profile:", err);
      }
    };

    fetchFreshProfile();
    return () => {
      isMounted = false;
    };
  }, [updateUser]);

  // Stats State — initialized to null to avoid fake numbers
  const [stats, setStats] = useState({
    projectsCount: null,
    vendorsCount: null,
    completedCount: null,
    approvalRate: null,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const [projectsRes, vendorsRes] = await Promise.all([
          getProjects().catch(() => null),
          getVendors().catch(() => null),
        ]);

        const projectsList = projectsRes?.data || [];
        const vendorsList = vendorsRes?.data || [];

        const approved = projectsList.filter(
          (p) => p.status === "Approved"
        ).length;
        const rejected = projectsList.filter(
          (p) => p.status === "Rejected"
        ).length;
        const completed = projectsList.filter(
          (p) => p.status === "Approved" || p.status === "Submitted"
        ).length;

        const totalEvaluated = approved + rejected;
        const rateStr =
          totalEvaluated > 0
            ? `${Math.round((approved / totalEvaluated) * 100)}%`
            : "—";

        if (isMounted) {
          setStats({
            projectsCount: projectsList.length,
            vendorsCount: vendorsList.length,
            completedCount: completed,
            approvalRate: rateStr,
          });
        }
      } catch (err) {
        console.error("Error fetching stats for profile:", err);
        if (isMounted) {
          setStats({
            projectsCount: 0,
            vendorsCount: 0,
            completedCount: 0,
            approvalRate: "—",
          });
        }
      } finally {
        if (isMounted) {
          setLoadingStats(false);
        }
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const userRole =
    user?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : user?.role === "VENDOR"
      ? "Vendor"
      : user?.role === "ADMIN"
      ? "Admin"
      : user?.role || "User";

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
          title="Profile"
          subtitle="Manage your account settings and preferences."
          showSearch={true}
        />

        {/* Main Body */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* 1. Profile Summary Card */}
          <div className="bg-[#FAF5F2] border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* User Avatar & Info */}
              <div className="flex items-center gap-4">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={displayName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-[#C8B5AC] text-white flex items-center justify-center font-bold text-2xl border-2 border-white shadow-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-[#3E3734]">
                      {displayName}
                    </h2>
                    <span className="bg-[#E8F5E9] border border-[#2E7D32]/20 text-[#2E7D32] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {userRole}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#817B77]">
                    {user?.department
                      ? `${user.department} • FIELDcam`
                      : "FIELDcam User"}
                  </p>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 bg-[#C8B5AC] hover:bg-[#B8A399] text-[#3E3734] px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                <FiEdit2 className="text-xs" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Profile Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/80 border border-[#E8E2DE] rounded-xl p-3.5 text-center shadow-2xs">
                <p className="text-xl font-bold text-[#3E3734]">
                  {loadingStats ? "..." : stats.projectsCount ?? 0}
                </p>
                <p className="text-[10px] font-bold tracking-wider text-[#A39A94] uppercase mt-0.5">
                  PROJECTS
                </p>
              </div>

              <div className="bg-white/80 border border-[#E8E2DE] rounded-xl p-3.5 text-center shadow-2xs">
                <p className="text-xl font-bold text-[#3E3734]">
                  {loadingStats ? "..." : stats.vendorsCount ?? 0}
                </p>
                <p className="text-[10px] font-bold tracking-wider text-[#A39A94] uppercase mt-0.5">
                  VENDORS
                </p>
              </div>

              <div className="bg-white/80 border border-[#E8E2DE] rounded-xl p-3.5 text-center shadow-2xs">
                <p className="text-xl font-bold text-[#3E3734]">
                  {loadingStats ? "..." : stats.completedCount ?? 0}
                </p>
                <p className="text-[10px] font-bold tracking-wider text-[#A39A94] uppercase mt-0.5">
                  COMPLETED
                </p>
              </div>

              <div className="bg-white/80 border border-[#E8E2DE] rounded-xl p-3.5 text-center shadow-2xs">
                <p className="text-xl font-bold text-[#3E3734]">
                  {loadingStats ? "..." : stats.approvalRate ?? "—"}
                </p>
                <p className="text-[10px] font-bold tracking-wider text-[#A39A94] uppercase mt-0.5">
                  APPROVAL
                </p>
              </div>
            </div>
          </div>

          {/* 2. Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E8E2DE] pb-1">
            {["Personal Info", "Security", "Notifications"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-white text-[#3E3734] shadow-xs border border-[#E8E2DE]"
                    : "text-[#817B77] hover:text-[#3E3734]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 3. Tab Content */}
          {activeTab === "Personal Info" && (
            <div className="space-y-6">
              {/* Two-Column Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Contact Information */}
                <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                  <h3 className="text-sm font-bold text-[#3E3734]">
                    Contact Information
                  </h3>

                  <div className="space-y-3.5 pt-1 text-xs">
                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                        <FiMail className="text-sm text-[#817B77]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                          EMAIL
                        </p>
                        <p className="font-semibold text-[#3E3734] mt-0.5">
                          {user?.email || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                        <FiPhone className="text-sm text-[#817B77]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                          PHONE
                        </p>
                        <p className="font-semibold text-[#3E3734] mt-0.5">
                          {user?.phone || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                        <FiMapPin className="text-sm text-[#817B77]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                          LOCATION
                        </p>
                        <p className="font-semibold text-[#3E3734] mt-0.5">
                          {user?.location || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                        <FiBriefcase className="text-sm text-[#817B77]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                          DEPARTMENT
                        </p>
                        <p className="font-semibold text-[#3E3734] mt-0.5">
                          {user?.department || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Account Details */}
                <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                  <h3 className="text-sm font-bold text-[#3E3734]">
                    Account Details
                  </h3>

                  <div className="space-y-3.5 pt-1 text-xs">
                    {/* Timezone */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                        <FiGlobe className="text-sm text-[#817B77]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                          TIMEZONE
                        </p>
                        <p className="font-semibold text-[#3E3734] mt-0.5">
                          {user?.timezone || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                        <FiClock className="text-sm text-[#817B77]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                          MEMBER SINCE
                        </p>
                        <p className="font-semibold text-[#3E3734] mt-0.5">
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Last Login */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                        <FiKey className="text-sm text-[#817B77]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                          LAST LOGIN
                        </p>
                        <p className="font-semibold text-[#3E3734] mt-0.5">
                          {user?.lastLogin
                            ? new Date(user.lastLogin).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Account Status */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                        <FiShield className="text-sm text-[#817B77]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                          ACCOUNT STATUS
                        </p>
                        <p className="font-semibold text-[#2E7D32] mt-0.5 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
                          <span>{user?.status || "Active"}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Section */}
              <RecentActivity />
            </div>
          )}

          {activeTab === "Security" && (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4 max-w-2xl">
              <h3 className="text-sm font-bold text-[#3E3734] flex items-center gap-2">
                <FiLock className="text-sm text-[#817B77]" />
                <span>Security & Password Settings</span>
              </h3>
              <p className="text-xs text-[#817B77]">
                Account security and access controls are managed via system authentication.
              </p>

              <div className="p-4 bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#3E3734]">Authentication Provider</p>
                  <p className="text-[11px] text-[#817B77]">System Managed JWT / Session</p>
                </div>
                <span className="text-xs font-medium text-[#817B77] bg-white border border-[#E8E2DE] px-3 py-1 rounded-lg">
                  Active
                </span>
              </div>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4 max-w-2xl">
              <h3 className="text-sm font-bold text-[#3E3734] flex items-center gap-2">
                <FiBell className="text-sm text-[#817B77]" />
                <span>Notification Preferences</span>
              </h3>
              <p className="text-xs text-[#817B77]">
                System notifications and alerts are configured at the application level.
              </p>

              <div className="p-4 bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl text-xs text-[#817B77]">
                Personalized notification preferences are currently managed system-wide.
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default Profile;
