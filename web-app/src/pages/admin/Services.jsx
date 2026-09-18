import { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import GeneralInformation from "../../components/admin/services/GeneralInformation";
import PhotoChecklist from "../../components/admin/services/PhotoChecklist";
import WorkflowRules from "../../components/admin/services/WorkflowRules";
import ConfigurationSummary from "../../components/admin/services/ConfigurationSummary";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const initialChecklist = [
  {
    id: 1,
    title: "Before Service Overview",
    badge: "REQUIRED • WIDE ANGLE",
  },
  {
    id: 2,
    title: "Serial Number Plate",
    badge: "REQUIRED • CLOSE UP",
  },
  {
    id: 3,
    title: "After Service Results",
    badge: "OPTIONAL • HIGH DETAIL",
  },
];

const Services = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Controlled Form State
  const [serviceCategory, setServiceCategory] = useState("Maintenance");
  const [serviceTypeName, setServiceTypeName] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("0.00");
  const [checklistItems, setChecklistItems] = useState(initialChecklist);
  const [serviceLogic, setServiceLogic] = useState(
    "IF service_duration > 2h THEN\napply_buffer_30m..."
  );
  const [requireSignature, setRequireSignature] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [notifyClient, setNotifyClient] = useState(true);

  // Validation & Save Feedback State
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setValidationError("");

    // Basic Validation
    if (!serviceCategory) {
      setValidationError("Please select a Service Category.");
      return;
    }
    if (!defaultPrice || isNaN(parseFloat(defaultPrice))) {
      setValidationError("Please enter a valid Default Price.");
      return;
    }

    // Success feedback
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const handleCancel = () => {
    setServiceCategory("Maintenance");
    setServiceTypeName("");
    setDefaultPrice("0.00");
    setChecklistItems(initialChecklist);
    setServiceLogic("IF service_duration > 2h THEN\napply_buffer_30m...");
    setRequireSignature(true);
    setAutoApprove(false);
    setNotifyClient(true);
    setSaveSuccess(false);
    setValidationError("");
  };

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
        {/* Top Header */}
        <AdminHeader
          title="Service Configuration"
          subtitle="Manage and track all field operation projects."
          showSearch={true}
        />

        {/* Main Body */}
        <main className="flex-1 p-6 space-y-6">
          {/* Page Title & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#3E3734]">Service Details</h1>
              <p className="text-xs text-[#817B77] mt-0.5">
                Define the core rules, pricing, and required documentation for this service.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-white hover:bg-[#F2EBE5] text-[#6E6763] hover:text-[#3E3734] border border-[#E8E2DE] px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="bg-[#8A817C] hover:bg-[#6E6763] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>

          {/* Inline Feedback Alerts */}
          {saveSuccess && (
            <div className="bg-[#E8F5E9] border border-[#2E7D32]/20 text-[#2E7D32] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
              <FiCheckCircle className="text-base shrink-0" />
              <span>Configuration saved successfully!</span>
            </div>
          )}

          {validationError && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
              <FiAlertCircle className="text-base shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 2-Column Grid Layout (Left wider 2-col, Right narrower 1-col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            {/* Left Column (General Info & Photo Checklist) */}
            <div className="lg:col-span-2 space-y-5">
              <GeneralInformation
                serviceCategory={serviceCategory}
                setServiceCategory={setServiceCategory}
                serviceTypeName={serviceTypeName}
                setServiceTypeName={setServiceTypeName}
                defaultPrice={defaultPrice}
                setDefaultPrice={setDefaultPrice}
              />

              <PhotoChecklist
                checklistItems={checklistItems}
                setChecklistItems={setChecklistItems}
              />
            </div>

            {/* Right Column (Workflow Rules & Configuration Summary) */}
            <div className="lg:col-span-1 space-y-5">
              <WorkflowRules
                serviceLogic={serviceLogic}
                setServiceLogic={setServiceLogic}
                requireSignature={requireSignature}
                setRequireSignature={setRequireSignature}
                autoApprove={autoApprove}
                setAutoApprove={setAutoApprove}
                notifyClient={notifyClient}
                setNotifyClient={setNotifyClient}
              />

              <ConfigurationSummary
                serviceCategory={serviceCategory}
                checklistCount={checklistItems.length}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Services;
