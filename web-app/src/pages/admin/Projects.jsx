import { useState, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import ProjectToolbar from "../../components/admin/projects/ProjectToolbar";
import ProjectFilters from "../../components/admin/projects/ProjectFilters";
import ProjectTable from "../../components/admin/projects/ProjectTable";

const initialProjects = [
  {
    id: "PRJ-2847",
    address: "1420 NW Couch St, Port",
    service: "Site Inspection",
    vendor: "Apex Field Co.",
    dueDate: "Mar 18",
    status: "New",
  },
  {
    id: "PRJ-2846",
    address: "500 Pike St, Seattle, WA",
    service: "Property Survey",
    vendor: "SiteLine Pro",
    dueDate: "Mar 20",
    status: "In Progress",
  },
  {
    id: "PRJ-2845",
    address: "2100 Lawrence St, Denv",
    service: "Progress Documentation",
    vendor: "ClearVision Studios",
    dueDate: "Mar 15",
    status: "Submitted",
  },
  {
    id: "PRJ-2844",
    address: "800 W 6th St, Austin, TX",
    service: "Final Inspection",
    vendor: "FieldEye Inc.",
    dueDate: "Mar 22",
    status: "In Progress",
  },
  {
    id: "PRJ-2843",
    address: "4500 E Van Buren St, Pho",
    service: "Aerial Mapping",
    vendor: "OpsLens",
    dueDate: "Mar 25",
    status: "New",
  },
  {
    id: "PRJ-2842",
    address: "330 S Broadway, Los An",
    service: "Site Inspection",
    vendor: "CamTrack",
    dueDate: "Mar 14",
    status: "Approved",
  },
  {
    id: "PRJ-2841",
    address: "1500 Market St, Philadel",
    service: "Progress Documentation",
    vendor: "Apex Field Co.",
    dueDate: "Mar 12",
    status: "Rejected",
  },
  {
    id: "PRJ-2840",
    address: "200 Lakeside Ave, Clevel",
    service: "Property Survey",
    vendor: "SiteLine Pro",
    dueDate: "Mar 28",
    status: "New",
  },
];

const Projects = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      // Filter by status tab
      if (activeFilter !== "All" && project.status !== activeFilter) {
        return false;
      }

      // Filter by search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          project.id.toLowerCase().includes(query) ||
          project.address.toLowerCase().includes(query) ||
          project.vendor.toLowerCase().includes(query) ||
          project.service.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [searchTerm, activeFilter]);

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      {/* Fixed Sidebar */}
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container Area */}
      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Projects Page Header */}
        <AdminHeader
          title="Projects"
          subtitle="Manage and track all field operation projects."
          showSearch={true}
        />

        {/* Projects Page Body */}
        <main className="flex-1 p-6 space-y-4">
          {/* 1. Project Toolbar (Search, Export, New Project) */}
          <ProjectToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {/* 2. Project Filters (Status Pills, More Filters, Approval Requests) */}
          <ProjectFilters
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          {/* 3. Project Table Card */}
          <ProjectTable projects={filteredProjects} />
        </main>
      </div>
    </div>
  );
};

export default Projects;
