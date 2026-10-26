import { useState, useEffect, useCallback, useMemo } from "react";
import SuperAdminSidebar from "../../components/super-admin/SuperAdminSidebar";
import SuperAdminHeader from "../../components/super-admin/SuperAdminHeader";
import SuperAdminMetricCard from "../../components/super-admin/SuperAdminMetricCard";
import RolesTable from "../../components/super-admin/RolesTable";
import CreateEditRoleModal from "../../components/super-admin/CreateEditRoleModal";
import DeleteRoleModal from "../../components/super-admin/DeleteRoleModal";
import ViewRoleModal from "../../components/super-admin/ViewRoleModal";
import { getRoles } from "../../services/roleService.js";
import {
  FiPlus,
  FiShield,
  FiLock,
  FiLayers,
  FiUsers,
  FiRefreshCw,
  FiFilter,
  FiSearch,
} from "react-icons/fi";

const Roles = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL"); // "ALL", "SYSTEM", "CUSTOM"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);

  // Modal states
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRoleForDelete, setSelectedRoleForDelete] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRoleForView, setSelectedRoleForView] = useState(null);

  // Fetch roles list from API
  const fetchRolesList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (typeFilter === "SYSTEM") {
        params.type = "SYSTEM";
      } else if (typeFilter === "CUSTOM") {
        params.type = "CUSTOM";
      }

      const res = await getRoles(params);
      if (res?.success && Array.isArray(res?.data)) {
        setRoles(res.data);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load roles from the platform server."
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery, typeFilter]);

  // Initial and reactive load
  useEffect(() => {
    fetchRolesList();
  }, [fetchRolesList]);

  // Summary telemetry calculations
  const stats = useMemo(() => {
    const total = roles.length;
    const system = roles.filter((r) => r.isSystem).length;
    const custom = roles.filter((r) => !r.isSystem).length;
    const assigned = roles.reduce(
      (acc, r) => acc + (Number(r.userCount) || 0),
      0
    );

    return { total, system, custom, assigned };
  }, [roles]);

  // Modal open helpers
  const handleOpenCreateModal = () => {
    setSelectedRoleForEdit(null);
    setIsCreateEditOpen(true);
  };

  const handleOpenEditModal = (role) => {
    setSelectedRoleForEdit(role);
    setIsCreateEditOpen(true);
  };

  const handleOpenDeleteModal = (role) => {
    setSelectedRoleForDelete(role);
    setIsDeleteOpen(true);
  };

  const handleOpenViewModal = (role) => {
    setSelectedRoleForView(role);
    setIsViewOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex text-[#2D3436]">
      {/* Sidebar */}
      <SuperAdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[220px]"
        }`}
      >
        {/* Header */}
        <SuperAdminHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Content Body */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Top Page Heading & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#2D3436] tracking-tight">
                Roles & Access
              </h1>
              <p className="text-xs md:text-sm text-[#817B77] mt-1 font-medium">
                Manage platform administrative roles, custom permissions, and role assignments.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#817B77] hover:bg-[#6E6763] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                <FiPlus className="text-sm" />
                <span>Create New Role</span>
              </button>

              {error && (
                <button
                  type="button"
                  onClick={fetchRolesList}
                  className="p-2.5 bg-white border border-[#EBE6E3] text-[#6E6763] hover:text-[#2D3436] rounded-xl transition cursor-pointer"
                  title="Retry loading roles"
                >
                  <FiRefreshCw className="text-sm" />
                </button>
              )}
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={fetchRolesList}
                className="underline hover:text-red-900 font-bold ml-4 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <SuperAdminMetricCard
              title="Total Roles"
              value={`${stats.total}`}
              change={null}
              isAvailable={true}
              icon={FiShield}
              iconBg="bg-indigo-50 text-indigo-600 border border-indigo-100"
            />

            <SuperAdminMetricCard
              title="System Roles"
              value={`${stats.system}`}
              change={null}
              isAvailable={true}
              icon={FiLock}
              iconBg="bg-purple-50 text-purple-600 border border-purple-100"
            />

            <SuperAdminMetricCard
              title="Custom Roles"
              value={`${stats.custom}`}
              change={null}
              isAvailable={true}
              icon={FiLayers}
              iconBg="bg-blue-50 text-blue-600 border border-blue-100"
            />

            <SuperAdminMetricCard
              title="Assigned Admins"
              value={`${stats.assigned}`}
              change={null}
              isAvailable={true}
              icon={FiUsers}
              iconBg="bg-emerald-50 text-emerald-600 border border-emerald-100"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-[#EBE6E3] rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={() => setTypeFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  typeFilter === "ALL"
                    ? "bg-[#817B77] text-white shadow-xs"
                    : "text-[#6E6763] hover:text-[#2D3436] hover:bg-[#FAF7F5]"
                }`}
              >
                All Roles ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("SYSTEM")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  typeFilter === "SYSTEM"
                    ? "bg-[#817B77] text-white shadow-xs"
                    : "text-[#6E6763] hover:text-[#2D3436] hover:bg-[#FAF7F5]"
                }`}
              >
                System Roles ({stats.system})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("CUSTOM")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  typeFilter === "CUSTOM"
                    ? "bg-[#817B77] text-white shadow-xs"
                    : "text-[#6E6763] hover:text-[#2D3436] hover:bg-[#FAF7F5]"
                }`}
              >
                Custom Roles ({stats.custom})
              </button>
            </div>

            {/* In-table Search Bar */}
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#817B77] text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roles..."
                className="w-full h-9 pl-9 pr-3 bg-white border border-[#EBE6E3] rounded-xl text-xs text-[#2D3436] placeholder:text-[#A39A94] focus:border-[#5141F5] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Roles Table */}
          <RolesTable
            roles={roles}
            loading={loading}
            onViewRole={handleOpenViewModal}
            onEditRole={handleOpenEditModal}
            onDeleteRole={handleOpenDeleteModal}
          />
        </main>
      </div>

      {/* Create / Edit Role Modal */}
      <CreateEditRoleModal
        isOpen={isCreateEditOpen}
        onClose={() => {
          setIsCreateEditOpen(false);
          setSelectedRoleForEdit(null);
        }}
        onSuccess={fetchRolesList}
        roleToEdit={selectedRoleForEdit}
      />

      {/* Delete Role Modal */}
      <DeleteRoleModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedRoleForDelete(null);
        }}
        onSuccess={fetchRolesList}
        role={selectedRoleForDelete}
      />

      {/* View Role Permissions Modal */}
      <ViewRoleModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedRoleForView(null);
        }}
        role={selectedRoleForView}
      />
    </div>
  );
};

export default Roles;
