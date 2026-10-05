import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";
import { getStaffProjects } from "../../services/projectService";
import { getProfile } from "../../services/authService";
import {
  FiMail,
  FiPhone,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiShield,
  FiAlertCircle,
  FiRefreshCw,
  FiLoader,
  FiMapPin,
} from "react-icons/fi";

const StaffProfile = () => {
  const { user, updateUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStaffProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [freshUserRes, projectsRes] = await Promise.all([
        getProfile().catch(() => null),
        getStaffProjects().catch(() => null),
      ]);

      if (freshUserRes?.success && freshUserRes?.data) {
        updateUser(freshUserRes.data);
      }

      const rawProjects = projectsRes?.data || projectsRes || [];
      setProjects(Array.isArray(rawProjects) ? rawProjects : []);
    } catch (err) {
      console.error("Error loading staff profile dataset:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load staff profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffProfileData();
  }, []);

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

  const displayName =
    user?.name || user?.email?.split("@")[0] || "Staff Member";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const userStatus = user?.status || (user?.isVerified ? "ACTIVE" : "ACTIVE");
  const contactEmail = user?.email || "—";
  const contactPhone = user?.phone || "—";
  const joinedDate = formatDate(user?.createdAt);

  const totalAssigned = projects.length;
  const inProgressCount = projects.filter(
    (p) => (p.status || "").toUpperCase() === "IN PROGRESS"
  ).length;
  const completedCount = projects.filter(
    (p) =>
      (p.status || "").toUpperCase() === "APPROVED" ||
      (p.status || "").toUpperCase() === "COMPLETED"
  ).length;

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      {/* Staff Sidebar */}
      <StaffSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container Area */}
      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Staff Header */}
        <StaffHeader
          title="Staff Profile"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showSearch={false}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">

          {/* Section 1: Profile Hero Card */}
          <div className="bg-white rounded-2xl border border-[#E8E2DE] shadow-xs overflow-hidden">
            {/* Cover Banner */}
            <div className="h-28 bg-[#5141F5]/80 relative flex items-center justify-center">
            </div>

            {/* Profile Info Row */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-8 mb-4">
                <div className="flex items-end gap-4">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={displayName}
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#5141F5] text-white font-bold text-2xl flex items-center justify-center border-4 border-white shadow-md shrink-0">
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
                        {userStatus}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#817B77] mt-0.5">
                      Field Staff Member
                    </p>
                  </div>
                </div>
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
                  <FiCalendar className="text-xs text-[#A39A94]" />
                  <span>Joined {joinedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Total Assigned */}
            <div className="bg-white rounded-2xl border border-[#E8E2DE] p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-[#3E3734] tracking-tight">
                  {loading ? "..." : totalAssigned}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">Assigned Projects</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] text-[#1565C0] flex items-center justify-center font-bold shrink-0">
                <FiBriefcase size={18} />
              </div>
            </div>

            {/* Card 2: In Progress */}
            <div className="bg-white rounded-2xl border border-[#E8E2DE] p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-[#3E3734] tracking-tight">
                  {loading ? "..." : inProgressCount}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">In Progress</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] text-[#ED6C02] flex items-center justify-center font-bold shrink-0">
                <FiClock size={18} />
              </div>
            </div>

            {/* Card 3: Completed */}
            <div className="bg-white rounded-2xl border border-[#E8E2DE] p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-[#3E3734] tracking-tight">
                  {loading ? "..." : completedCount}
                </div>
                <p className="text-xs font-bold text-[#817B77] mt-0.5">Completed</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold shrink-0">
                <FiCheckCircle size={18} />
              </div>
            </div>
          </div>

          {/* Section 3: Detailed Account Information & Assigned Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Account Details Card */}
            <div className="bg-white rounded-2xl border border-[#E8E2DE] p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#3E3734]">Account Information</h3>

              <div className="space-y-4 text-xs">
                {/* Full Name */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                    <FiUser className="text-sm text-[#817B77]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                      FULL NAME
                    </p>
                    <p className="font-semibold text-[#3E3734] mt-0.5">
                      {displayName}
                    </p>
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                    <FiMail className="text-sm text-[#817B77]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                      EMAIL ADDRESS
                    </p>
                    <p className="font-semibold text-[#3E3734] mt-0.5">
                      {contactEmail}
                    </p>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                    <FiPhone className="text-sm text-[#817B77]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                      PHONE NUMBER
                    </p>
                    <p className="font-semibold text-[#3E3734] mt-0.5">
                      {contactPhone}
                    </p>
                  </div>
                </div>

                {/* System Role */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#E8E2DE] flex items-center justify-center shrink-0 mt-0.5">
                    <FiShield className="text-sm text-[#817B77]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                      SYSTEM ROLE
                    </p>
                    <p className="font-semibold text-[#3E3734] mt-0.5">
                      STAFF (Field Staff)
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
              </div>
            </div>

            {/* Assigned Projects List Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E2DE] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F2EBE5] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#3E3734]">Assigned Projects Overview</h3>
                  <p className="text-xs text-[#817B77] mt-0.5">
                    Projects allocated to your staff account by your vendor partner
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-[#817B77] space-y-2">
                  <FiLoader className="animate-spin text-2xl mx-auto text-[#8A817C]" />
                  <p className="font-semibold">Loading assigned projects...</p>
                </div>
              ) : projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div
                      key={proj._id || proj.projectId}
                      className="bg-[#FAF7F5] border border-[#E8E2DE] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#817B77] bg-white border border-[#E8E2DE] px-2 py-0.5 rounded">
                            {proj.projectId || "PRJ"}
                          </span>
                          <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded">
                            {proj.status || "Assigned"}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#3E3734] truncate">
                          {proj.projectName}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-[#817B77]">
                          <span className="flex items-center gap-1">
                            <FiMapPin className="text-xs shrink-0" />
                            <span className="truncate">{proj.location || "N/A"}</span>
                          </span>
                          {proj.deadline && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <FiCalendar className="text-xs shrink-0" />
                                <span>{new Date(proj.deadline).toLocaleDateString()}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#FAF7F5] border border-dashed border-[#E8E2DE] rounded-xl p-10 text-center text-xs text-[#817B77] space-y-1">
                  <FiBriefcase className="text-3xl mx-auto text-[#A39A94]" />
                  <p className="font-bold text-[#3E3734]">No Projects Assigned</p>
                  <p>When your vendor assigns projects to your staff account, they will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffProfile;
