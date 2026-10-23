import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import VendorHeader from "../../components/vendor/VendorHeader";
import EditProfileModal from "../../components/admin/EditProfileModal";
import { getProfile } from "../../services/authService";
import { getMyVendorProfile } from "../../services/vendorService";
import { getProjects } from "../../services/projectService";
import { getMyAuditLogs } from "../../services/auditService";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiStar,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiGlobe,
  FiUsers,
  FiTrendingUp,
  FiAlertCircle,
  FiRefreshCw,
  FiImage,
  FiPlusCircle,
  FiEdit,
  FiFileText,
  FiGrid,
  FiLifeBuoy,
  FiFolder,
} from "react-icons/fi";

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

  switch (entityType) {
    case "Vendor":
      return { title: "Vendor Activity", icon: FiUsers, bg: "bg-[#E3F2FD]", color: "text-[#1565C0]" };
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

const VendorProfile = () => {
  const { user, updateUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [vendorProfile, setVendorProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [freshUserRes, vendorProfileRes, projectsRes, auditRes] = await Promise.all([
        getProfile().catch(() => null),
        getMyVendorProfile().catch(() => null),
        getProjects().catch(() => null),
        getMyAuditLogs({ limit: 5 }).catch(() => null),
      ]);

      if (freshUserRes?.success && freshUserRes?.data) {
        updateUser(freshUserRes.data);
      }

      if (vendorProfileRes) {
        setVendorProfile(vendorProfileRes.data || vendorProfileRes);
      }

      const rawProjects = projectsRes?.data || projectsRes || [];
      setProjects(Array.isArray(rawProjects) ? rawProjects : []);

      const rawAudit = auditRes?.data || [];
      setActivities(Array.isArray(rawAudit) ? rawAudit : []);
    } catch (err) {
      console.error("Error loading vendor profile dataset:", err);
      setError(err.response?.data?.message || err.message || "Failed to load vendor profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Derive display values from real user & vendor profile data
  const displayName =
    vendorProfile?.companyName ||
    vendorProfile?.contactName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Vendor Partner";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const vendorStatus = vendorProfile?.status || user?.status || "Active";
  const vendorRating =
    vendorProfile?.rating !== undefined && vendorProfile?.rating !== null
      ? Number(vendorProfile.rating).toFixed(1)
      : "N/A";

  const contactEmail = user?.email || "—";
  const contactPhone = user?.phone || "—";
  const contactLocation = vendorProfile?.location || user?.location || "—";
  const companyName = vendorProfile?.companyName || "—";
  const joinedDate = formatDate(
    vendorProfile?.joinedDate || vendorProfile?.createdAt || user?.createdAt
  );

  // Derived real project statistics
  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (p) => p.status === "Approved" || p.status === "Completed"
  ).length;
  const activeProjects = projects.filter(
    (p) => p.status === "In Progress" || p.status === "Submitted" || p.status === "Under Review"
  ).length;

  // Recent 4 projects
  const recentProjects = projects.slice(0, 4);

  // Vendor Services / Specialties
  const specialties = Array.isArray(vendorProfile?.services) ? vendorProfile.services : [];

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      {/* Vendor Sidebar */}
      <VendorSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container Area */}
      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Vendor Header */}
        <VendorHeader title="Vendor Profile" vendorName={displayName} />

        {/* Page Content Body */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Error Banner */}
          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={loadProfileData}
                className="flex items-center gap-1.5 bg-[#C62828] text-white px-3 py-1.5 rounded-xl font-bold hover:bg-[#B71C1C] transition-colors cursor-pointer"
              >
                <FiRefreshCw className="text-xs" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Section 1: Profile Hero / Vendor Header Card */}
          <div className="bg-white rounded-2xl border border-[#E8E2DE] shadow-xs overflow-hidden">
            {/* Top Cover Banner */}
            <div className="h-32 bg-gradient-to-r from-[#D8C7C0] via-[#E8DED8] to-[#C8B5AC] relative flex items-center justify-center">
              <FiImage className="text-4xl text-[#3E3734]/15" />
            </div>

            {/* Profile Info Row */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-10 mb-4">
                {/* Avatar & Name */}
                <div className="flex items-end gap-4">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={displayName}
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#E07A5F] text-white font-bold text-2xl flex items-center justify-center border-4 border-white shadow-md shrink-0">
                      {initials}
                    </div>
                  )}

                  <div className="pb-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl font-extrabold text-[#3E3734] tracking-tight">
                        {displayName}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                        {vendorStatus}
                      </span>
                      {vendorRating !== "N/A" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/20">
                          <FiStar className="text-[11px] fill-[#D97706]" />
                          {vendorRating}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#817B77] mt-0.5">
                      Vendor Partner
                    </p>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#EAE4DF] hover:bg-[#E0D7D0] text-[#3E3734] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border border-[#E8E2DE]"
                >
                  <FiEdit2 size={13} />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Contact Information Bar */}
              <div className="flex items-center gap-x-6 gap-y-2 flex-wrap text-xs text-[#817B77] font-medium pt-3 border-t border-[#E8E2DE]">
                <div className="flex items-center gap-1.5">
                  <FiMail className="text-xs text-[#A39A94]" />
                  <span>{contactEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiPhone className="text-xs text-[#A39A94]" />
                  <span>{contactPhone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiMapPin className="text-xs text-[#A39A94]" />
                  <span>{contactLocation}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiBriefcase className="text-xs text-[#A39A94]" />
                  <span>{companyName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiCalendar className="text-xs text-[#A39A94]" />
                  <span>Joined {joinedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Stats Row (4 KPI Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Projects */}
            <div className="bg-white rounded-2xl border border-[#E8E2DE] p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-[#3E3734] tracking-tight">
                  {loading ? "..." : totalProjects}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">Total Projects</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] text-[#1565C0] flex items-center justify-center font-bold shrink-0">
                <FiBriefcase size={18} />
              </div>
            </div>

            {/* Card 2: Completed */}
            <div className="bg-white rounded-2xl border border-[#E8E2DE] p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-[#3E3734] tracking-tight">
                  {loading ? "..." : completedProjects}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">Completed</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold shrink-0">
                <FiCheckCircle size={18} />
              </div>
            </div>

            {/* Card 3: Active Now */}
            <div className="bg-white rounded-2xl border border-[#E8E2DE] p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-[#3E3734] tracking-tight">
                  {loading ? "..." : activeProjects}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">Active Now</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold shrink-0">
                <FiTrendingUp size={18} />
              </div>
            </div>

            {/* Card 4: Avg Rating */}
            <div className="bg-white rounded-2xl border border-[#E8E2DE] p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-[#3E3734] tracking-tight">
                  {loading ? "..." : vendorRating}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">Avg Rating</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FFF8E1] text-[#F57F17] flex items-center justify-center font-bold shrink-0">
                <FiStar size={18} />
              </div>
            </div>
          </div>

          {/* Section 3: Main Content (2-Column Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* LEFT COLUMN (2 Columns on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Card */}
              <div className="bg-white rounded-2xl border border-[#E8E2DE] p-6 shadow-xs">
                <h3 className="text-base font-bold text-[#3E3734] mb-3">About</h3>
                <p className="text-xs text-[#817B77] font-medium leading-relaxed">
                  {user?.bio || vendorProfile?.bio || "No bio added yet."}
                </p>
              </div>

              {/* Specialties Card */}
              <div className="bg-white rounded-2xl border border-[#E8E2DE] p-6 shadow-xs">
                <h3 className="text-base font-bold text-[#3E3734] mb-3">Specialties</h3>
                {specialties.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF5F2] text-[#E07A5F] border border-[#E07A5F]/20"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#817B77] font-medium">
                    No specialties listed yet.
                  </p>
                )}
              </div>

              {/* Recent Projects Card */}
              <div className="bg-white rounded-2xl border border-[#E8E2DE] p-6 shadow-xs">
                <h3 className="text-base font-bold text-[#3E3734] mb-4">Recent Projects</h3>

                {loading ? (
                  <div className="py-8 text-center text-xs text-[#817B77]">
                    Loading vendor projects...
                  </div>
                ) : recentProjects.length > 0 ? (
                  <div className="space-y-3">
                    {recentProjects.map((p) => (
                      <div
                        key={p._id || p.projectId}
                        className="p-3.5 bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl flex items-center justify-between gap-4 text-xs hover:border-[#C8B5AC] transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-[#3E3734] block truncate">
                            {p.projectName || p.title || "FieldCam Project"}
                          </span>
                          <span className="text-[10px] text-[#817B77] font-semibold block truncate">
                            {p.projectId || "PRJ-GEN"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-black text-[#3E3734]">
                            {formatCurrency(p.totalAmount || p.amount)}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              p.status === "Approved" || p.status === "Completed"
                                ? "bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/20"
                                : p.status === "Rejected"
                                ? "bg-[#FFEBEE] text-[#C62828] border-[#C62828]/20"
                                : "bg-[#FEF3C7] text-[#D97706] border-[#D97706]/20"
                            }`}
                          >
                            • {p.status || "In Progress"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#817B77] font-medium py-4 text-center">
                    No recent projects yet.
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN (1 Column on large screens) */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <div className="bg-white rounded-2xl border border-[#E8E2DE] p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#3E3734]">Quick Info</h3>

                <div className="space-y-3.5 text-xs">
                  {/* Company */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                      <FiBriefcase className="text-sm text-[#817B77]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        COMPANY
                      </p>
                      <p className="font-semibold text-[#3E3734] mt-0.5">
                        {companyName}
                      </p>
                    </div>
                  </div>

                  {/* Website */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                      <FiGlobe className="text-sm text-[#817B77]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        WEBSITE
                      </p>
                      <p className="font-semibold text-[#3E3734] mt-0.5">
                        {user?.socialLinks?.website ? (
                          <a
                            href={user.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#E07A5F] hover:underline"
                          >
                            {user.socialLinks.website}
                          </a>
                        ) : (
                          "—"
                        )}
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
                        {contactLocation}
                      </p>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                      <FiCalendar className="text-sm text-[#817B77]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        MEMBER SINCE
                      </p>
                      <p className="font-semibold text-[#3E3734] mt-0.5">
                        {joinedDate}
                      </p>
                    </div>
                  </div>

                  {/* Team Size */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                      <FiUsers className="text-sm text-[#817B77]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                        TEAM SIZE
                      </p>
                      <p className="font-semibold text-[#3E3734] mt-0.5">—</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Card */}
              <div className="bg-white rounded-2xl border border-[#E8E2DE] p-6 shadow-xs">
                <h3 className="text-base font-bold text-[#3E3734] mb-4">Recent Activity</h3>

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
                        <div key={item._id} className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-full ${bg} ${color} flex items-center justify-center shrink-0 mt-0.5 border border-black/5`}
                            >
                              <Icon className="text-sm" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-[#3E3734]">{title}</h4>
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
            </div>
          </div>
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

export default VendorProfile;
