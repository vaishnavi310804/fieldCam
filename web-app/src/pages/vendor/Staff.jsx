import { useState, useEffect, useMemo } from "react";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import VendorHeader from "../../components/vendor/VendorHeader";
import StaffStats from "../../components/vendor/staff/StaffStats";
import StaffToolbar from "../../components/vendor/staff/StaffToolbar";
import StaffCard from "../../components/vendor/staff/StaffCard";
import AddStaffModal from "../../components/vendor/staff/AddStaffModal";
import AssignStaffProjectModal from "../../components/vendor/staff/AssignStaffProjectModal";
import EditStaffModal from "../../components/vendor/staff/EditStaffModal";
import {
  getVendorStaff,
  updateVendorStaffStatus,
  updateVendorStaff,
  createVendorStaff,
} from "../../services/vendorService";
import { getProjects } from "../../services/projectService";
import {
  FiUsers,
  FiPlus,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";

const Staff = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStaffForAssign, setSelectedStaffForAssign] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState(null);

  // Data & Request State
  const [staffList, setStaffList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");

  const loadStaffModuleData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch vendor staff list and vendor-scoped projects in parallel
      const [staffRes, projRes] = await Promise.all([
        getVendorStaff(),
        getProjects().catch(() => []),
      ]);

      const rawStaff = Array.isArray(staffRes)
        ? staffRes
        : staffRes?.data || [];
      const projectList = Array.isArray(projRes)
        ? projRes
        : projRes?.data || [];

      // Ensure staff records have accurate project counts derived from real records
      const enrichedStaff = rawStaff.map((staff) => {
        const staffIdStr = staff._id ? staff._id.toString() : "";
        const staffProjects = projectList.filter((p) => {
          const assignedId = p.assignedStaffId?._id || p.assignedStaffId;
          return assignedId && assignedId.toString() === staffIdStr;
        });

        const activeProjectsCount = staffProjects.filter((p) => {
          const s = (p.status || "").toUpperCase();
          return s !== "APPROVED" && s !== "COMPLETED";
        }).length;

        const completedProjectsCount = staffProjects.filter((p) => {
          const s = (p.status || "").toUpperCase();
          return s === "APPROVED" || s === "COMPLETED";
        }).length;

        return {
          ...staff,
          activeProjects:
            staff.activeProjects !== undefined
              ? staff.activeProjects
              : activeProjectsCount,
          completedProjects:
            staff.completedProjects !== undefined
              ? staff.completedProjects
              : completedProjectsCount,
        };
      });

      setStaffList(enrichedStaff);
      setProjects(projectList);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load vendor staff records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStaffModuleData();
  }, []);

  const handleAddStaff = async (payload) => {
    try {
      setError("");
      await createVendorStaff(payload);
      setStatusSuccess(
        "Staff member provisioned successfully! Onboarding email invite sent."
      );
      await loadStaffModuleData();
      setTimeout(() => setStatusSuccess(""), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create staff member";
      setError(msg);
      throw err;
    }
  };

  const handleToggleStatus = async (staffMember, newStatus) => {
    try {
      setError("");
      await updateVendorStaffStatus(staffMember._id, newStatus);
      setStatusSuccess(
        `Staff account status updated to ${newStatus === "ACTIVE" ? "Active" : "Inactive"}`
      );
      await loadStaffModuleData();
      setTimeout(() => setStatusSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update staff status"
      );
    }
  };

  const handleUpdateStaff = async (staffId, updateData) => {
    try {
      setError("");
      await updateVendorStaff(staffId, updateData);
      setStatusSuccess("Staff details updated successfully!");
      await loadStaffModuleData();
      setTimeout(() => setStatusSuccess(""), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update staff details";
      setError(msg);
      throw err;
    }
  };

  const handleOpenAssign = (staffMember) => {
    setSelectedStaffForAssign(staffMember);
    setIsAssignModalOpen(true);
  };

  const handleOpenEdit = (staffMember) => {
    setSelectedStaffForEdit(staffMember);
    setIsEditModalOpen(true);
  };

  const handleAssignSuccess = async (count = 1) => {
    setStatusSuccess(
      count === 1
        ? "Project assigned to staff member successfully!"
        : `${count} projects assigned to staff member successfully!`
    );
    await loadStaffModuleData();
    setTimeout(() => setStatusSuccess(""), 4000);
  };

  // Filter staff by status & search term
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      // 1. Status Filter
      const statusUpper = (staff.status || "ACTIVE").toUpperCase();
      if (activeFilter === "ACTIVE" && statusUpper !== "ACTIVE") {
        return false;
      }
      if (activeFilter === "INACTIVE" && statusUpper !== "INACTIVE") {
        return false;
      }

      // 2. Search Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const name = (staff.name || "").toLowerCase();
        const role = (staff.title || staff.department || "").toLowerCase();
        const loc = (staff.location || "").toLowerCase();
        const email = (staff.email || "").toLowerCase();
        const id = (staff._id || "").toLowerCase();

        return (
          name.includes(query) ||
          role.includes(query) ||
          loc.includes(query) ||
          email.includes(query) ||
          id.includes(query)
        );
      }

      return true;
    });
  }, [staffList, activeFilter, searchTerm]);

  // Derive Summary Metrics strictly from real backend records
  const derivedStats = useMemo(() => {
    const totalStaff = staffList.length;
    const activeNow = staffList.filter((s) => s.isOnline).length;
    const activeProjects = staffList.reduce(
      (sum, s) => sum + (s.activeProjects || 0),
      0
    );

    // If genuine rating is present in backend, compute average; otherwise N/A
    const ratedStaff = staffList.filter(
      (s) => s.rating !== undefined && s.rating !== null
    );
    let avgRating = "N/A";
    if (ratedStaff.length > 0) {
      const sum = ratedStaff.reduce((acc, s) => acc + Number(s.rating), 0);
      avgRating = (sum / ratedStaff.length).toFixed(1);
    }

    return {
      totalStaff,
      activeNow,
      activeProjects,
      avgRating,
    };
  }, [staffList]);

  // Derive Filter Tab Counts
  const filterCounts = useMemo(() => {
    const all = staffList.length;
    const active = staffList.filter(
      (s) => (s.status || "ACTIVE").toUpperCase() === "ACTIVE"
    ).length;
    const inactive = staffList.filter(
      (s) => (s.status || "ACTIVE").toUpperCase() === "INACTIVE"
    ).length;

    return { all, active, inactive };
  }, [staffList]);

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      {/* Fixed Vendor Sidebar */}
      <VendorSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container Area */}
      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Vendor Header */}
        <VendorHeader
          showSearch={true}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Staff Page Body */}
        <main className="flex-1 p-6 space-y-5">
          {/* Header Row: Title + Total team count + Add Staff Button */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8DCD5] text-[#3E3734] flex items-center justify-center shrink-0 shadow-2xs">
                <FiUsers className="text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#3E3734] leading-tight">
                  Staff Management
                </h1>
                <p className="text-xs text-[#817B77] mt-0.5">
                  {staffList.length} team member{staffList.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#C87A65] hover:bg-[#B36854] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <FiPlus size={14} />
              <span>Add Staff</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-base shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={loadStaffModuleData}
                className="flex items-center gap-1 underline cursor-pointer hover:opacity-80"
              >
                <FiRefreshCw size={12} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {statusSuccess && (
            <div className="bg-[#E8F5E9] border border-[#2E7D32]/20 text-[#2E7D32] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
              <FiCheckCircle className="text-base shrink-0" />
              <span>{statusSuccess}</span>
            </div>
          )}

          {/* 1. Summary KPI Cards (4 metrics) */}
          <StaffStats stats={derivedStats} />

          {/* 2. Toolbar (Search & Filter Pills) */}
          <StaffToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            counts={filterCounts}
          />

          {/* 3. Staff Cards Grid / Loading / Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-[#E8E2DE] h-64 animate-pulse p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#FAF7F5]" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-[#FAF7F5] rounded w-1/3" />
                      <div className="h-3 bg-[#FAF7F5] rounded w-1/4" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-10 bg-[#FAF7F5] rounded-xl" />
                    <div className="h-10 bg-[#FAF7F5] rounded-xl" />
                    <div className="h-10 bg-[#FAF7F5] rounded-xl" />
                  </div>
                  <div className="h-4 bg-[#FAF7F5] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-12 text-center text-[#817B77] shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F5] text-[#817B77] flex items-center justify-center mx-auto mb-2">
                <FiUsers size={22} />
              </div>
              <h3 className="text-sm font-bold text-[#3E3734]">
                {staffList.length === 0
                  ? "No Staff Members Provisioned"
                  : "No Matching Staff Members"}
              </h3>
              <p className="text-xs text-[#817B77] max-w-sm mx-auto">
                {staffList.length === 0
                  ? "Your vendor organization does not have any staff members yet. Click 'Add Staff' to provision your first team member."
                  : "No staff members match your selected search or filter criteria."}
              </p>
              {(activeFilter !== "All" || searchTerm) && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("All");
                    setSearchTerm("");
                  }}
                  className="mt-3 px-4 py-2 bg-[#FAF7F5] border border-[#E8E2DE] rounded-xl text-xs font-bold text-[#3E3734] hover:bg-[#EAE4DF] transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              {filteredStaff.map((staffMember) => (
                <StaffCard
                  key={staffMember._id}
                  staff={staffMember}
                  onAssignProject={handleOpenAssign}
                  onEditStaff={handleOpenEdit}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStaff={handleAddStaff}
      />

      {/* Assign Project Modal */}
      <AssignStaffProjectModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedStaffForAssign(null);
        }}
        staff={selectedStaffForAssign}
        projects={projects}
        onAssignSuccess={handleAssignSuccess}
      />

      {/* Edit Staff Modal */}
      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStaffForEdit(null);
        }}
        staff={selectedStaffForEdit}
        onUpdateStaff={handleUpdateStaff}
      />
    </div>
  );
};

export default Staff;
