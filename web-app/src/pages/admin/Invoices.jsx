import { useState, useMemo } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import InvoiceStats from "../../components/admin/invoices/InvoiceStats";
import PaymentOverview from "../../components/admin/invoices/PaymentOverview";
import InvoiceToolbar from "../../components/admin/invoices/InvoiceToolbar";
import InvoiceTable from "../../components/admin/invoices/InvoiceTable";

const initialInvoices = [
  {
    id: "INV-1042",
    vendor: "Apex Field Co.",
    project: "Downtown Plaza Inspection",
    projectId: "PRJ-2845",
    amount: "$4,250",
    tax: "$340",
    status: "Pending",
    paymentDate: "—",
  },
  {
    id: "INV-1041",
    vendor: "SiteLine Pro",
    project: "Harbor Bridge Survey",
    projectId: "PRJ-2846",
    amount: "$6,800",
    tax: "$544",
    status: "Approved",
    paymentDate: "—",
  },
  {
    id: "INV-1040",
    vendor: "ClearVision Studios",
    project: "Riverside Park Mapping",
    projectId: "PRJ-2839",
    amount: "$3,150",
    tax: "$252",
    status: "Paid",
    paymentDate: "Mar 5, 2026",
  },
  {
    id: "INV-1039",
    vendor: "FieldEye Inc.",
    project: "Tech Campus Phase 2",
    projectId: "PRJ-2844",
    amount: "$5,400",
    tax: "$432",
    status: "Pending",
    paymentDate: "—",
  },
  {
    id: "INV-1038",
    vendor: "OpsLens",
    project: "Solar Farm Layout",
    projectId: "PRJ-2843",
    amount: "$7,200",
    tax: "$576",
    status: "Approved",
    paymentDate: "—",
  },
  {
    id: "INV-1037",
    vendor: "CamTrack",
    project: "Broadway Building",
    projectId: "PRJ-2842",
    amount: "$2,800",
    tax: "$224",
    status: "Paid",
    paymentDate: "Mar 1, 2026",
  },
  {
    id: "INV-1036",
    vendor: "Apex Field Co.",
    project: "Market St Tower",
    projectId: "PRJ-2841",
    amount: "$3,600",
    tax: "$288",
    status: "Pending",
    paymentDate: "—",
  },
  {
    id: "INV-1035",
    vendor: "SiteLine Pro",
    project: "Lakeside Property",
    projectId: "PRJ-2840",
    amount: "$4,900",
    tax: "$392",
    status: "Paid",
    paymentDate: "Feb 28, 2026",
  },
];

const Invoices = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredInvoices = useMemo(() => {
    return initialInvoices.filter((invoice) => {
      // Filter by status tab
      if (activeFilter !== "All" && invoice.status !== activeFilter) {
        return false;
      }

      // Filter by search query (Invoice ID, Vendor, Project)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          invoice.id.toLowerCase().includes(query) ||
          invoice.vendor.toLowerCase().includes(query) ||
          invoice.project.toLowerCase().includes(query) ||
          invoice.projectId.toLowerCase().includes(query)
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
        {/* Invoices Page Header */}
        <AdminHeader
          title="Invoices"
          subtitle="Track payments and manage vendor invoices."
          showSearch={true}
        />

        {/* Invoices Page Body */}
        <main className="flex-1 p-6 space-y-5">
          {/* 1. Summary Cards */}
          <InvoiceStats />

          {/* 2. Payment Overview Recharts BarChart */}
          <PaymentOverview />

          {/* 3. Toolbar (Search, Filter Tabs, Export, New Invoice Buttons) */}
          <InvoiceToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          {/* 4. Invoice Table Card */}
          <InvoiceTable invoices={filteredInvoices} />
        </main>
      </div>
    </div>
  );
};

export default Invoices;
